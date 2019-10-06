pragma solidity ^0.5.0;

library OptimBookerLib {

    struct Node {
        uint fromDate;
        uint toDate;
        uint bid;
        uint next;
    }

    struct Storage {
        uint nextPos;
        uint nextBid;
        mapping (uint => Node) nodes;
    }

    uint constant HEAD = 0;
    uint constant JUNK = 999999; // We assume there won't be that many bookings

    int public constant NOT_FOUND = -1;
    int public constant BOOK_CONFLICT = -2;
    uint public constant INVALID = 9999999; // FIXME: want to change this?

    event Cancelled(uint bid);
    event Booked(uint bid);
    event Conflict();
    event Error(string msg);
    event Log(uint from, uint to);

    /// The list is empty if the HEAD node points to itself
    function isEmpty(Storage storage self) public view returns (bool)
    {
        return self.nodes[HEAD].next == HEAD;
    }

    function createLink(Storage storage self, uint fromNode, uint toNode) private
    {
        self.nodes[fromNode].next = toNode;
    }

    function _printAll(Storage storage self) public
    {
        uint curr = self.nodes[HEAD].next;
        while (curr != HEAD) {
            emit Log(self.nodes[curr].fromDate, self.nodes[curr].toDate);
            curr = self.nodes[curr].next;
        }
    }

    function _printJunk(Storage storage self) public
    {
        if (!junkIsEmpty(self)) {
            uint curr = self.nodes[JUNK].next;
            while (curr != JUNK) {
                emit Log(self.nodes[curr].fromDate, self.nodes[curr].toDate);
                curr = self.nodes[curr].next;
            }
        }
    }

    /// Returns true if junk is initialised: if it points to itself
    function junkNotInitialised(Storage storage self) private view returns (bool)
    {
        return self.nodes[JUNK].next == 0;
    }

    function junkIsEmpty(Storage storage self) private view returns (bool)
    {
        return junkNotInitialised(self) || self.nodes[JUNK].next == JUNK;
    }

    modifier junkNotEmpty(Storage storage self)
    {
        require(!junkIsEmpty(self));
        _;
    }

    // Adds the provided node to junk
    function addJunk(Storage storage self, uint node) private
    {
        require(node != JUNK, 'Cannot add provided node to Junk');
        if (junkNotInitialised(self)) {
            self.nodes[JUNK].next = JUNK;
        }
        createLink(self, node, self.nodes[JUNK].next);
        createLink(self, JUNK, node);
    }

    /// Pops the junk node at head of list and returns its index
    function popJunk(Storage storage self) private
    junkNotEmpty(self)
    returns (uint)
    {
        uint ret = self.nodes[JUNK].next;
        createLink(self, JUNK, self.nodes[ret].next);
        return ret;
    }

    /// Free all junk storage kept for reuse
    function freeJunk(Storage storage self) public
        junkNotEmpty(self)
    {
        while (!junkIsEmpty(self)) {
            uint idx = popJunk(self);
            delete self.nodes[idx];
        }
    }

    /// Removes node from the list. Requires the prevNode be provided.
    function removeNode(Storage storage self, uint node, uint prevNode) private
    {
        createLink(self, prevNode, self.nodes[node].next);
        addJunk(self, node);
    }

    /// Returns the next available position and updates it
    function useNextPos(Storage storage self) public returns (uint pos)
    {
        if (junkIsEmpty(self)) {
            return self.nextPos++;
        } else {
            // Recycle node
            return popJunk(self);
        }
    }

    function newNode(Storage storage self, uint prevNode, uint nextNode, uint bid, uint fromDate, uint toDate) private
    {
        uint nextPos = useNextPos(self);
        Node memory n = Node({
            fromDate: fromDate,
            toDate: toDate,
            bid: bid,
            next: nextNode
        });
        createLink(self, prevNode, nextPos);
        createLink(self, nextPos, nextNode);  // redundant, but there for readability
        self.nodes[nextPos] = n;
    }

    /// Called by book function
    ///
    ///     - Creates a new LinkedList node
    ///     - Emits Booking event
    ///     - Updates nextBid
    function newBook(Storage storage self, uint prevNode, uint nextNode, uint fromDate, uint toDate) private returns (uint)
    {
        require(toDate > fromDate, 'fromDate must be less than toDate');
        uint bid = self.nextBid++;
        newNode(self, prevNode, nextNode, bid, fromDate, toDate);
        emit Booked(bid);
        return bid;
    }

    function initialise(Storage storage self) public
    {
        self.nextPos = 1;
        // self.nodes[HEAD].next = HEAD; // (implicit since HEAD = 0)
        self.nodes[JUNK].next = JUNK;
    }

    function book(Storage storage self, uint fromDate, uint toDate) public returns (int)
    {
        require(fromDate < toDate, 'Invalid dates provided');
        // FIXME: uncomment below
        // if (fromDate <= now || fromDate >= toDate) {
        //     emit Error("Invalid date arguments");
        //     return -1;
        // }
        uint prev = HEAD;
        uint curr = self.nodes[HEAD].next;
        while (curr != HEAD) {
            uint x = self.nodes[curr].fromDate;
            uint y = self.nodes[curr].toDate;
            // if (y <= now) {
                // FIXME:
                // Remove curr node
                // self.head = self.nodes[curr].next;
                // TODO: addJunk(curr);
                // prev = 0;
                // curr = self.head;
            // } else
            if (fromDate >= y) {
                // TODO: self.freeJunk()
                return int(newBook(self, prev, curr, fromDate, toDate));
            } else if (toDate <= x) {
                prev = curr;
                curr = self.nodes[curr].next;
            } else {
                emit Conflict();
                return -1;
            }
        }
        return int(newBook(self, prev, HEAD, fromDate, toDate));
    }

    function cancel(Storage storage self, uint bid) public returns (int)
    {
        uint prev = HEAD;
        uint curr = self.nodes[prev].next;
        // Find node with matching bid, then remove it
        while (curr != HEAD) {
            if (self.nodes[curr].bid == bid) {
                removeNode(self, curr, prev);
                emit Cancelled(bid);
                return int(bid);
            }
            prev = curr;
            curr = self.nodes[curr].next;
        }
        return NOT_FOUND;
    }

    /// Return index of found id
    function find(Storage storage self, uint id) public view returns (int) {
        if ( isEmpty(self) ) {
            return NOT_FOUND;
        }
        uint curr = self.nodes[HEAD].next;
        while (curr != HEAD) {
            if (self.nodes[curr].bid == id) {
                return int(curr);
            }
            curr = self.nodes[curr].next;
        }
        return NOT_FOUND;
    }


    function getDates(Storage storage self, uint id) public view returns (uint fromDate, uint toDate) {
        int idx = find(self, id);
        require(idx != NOT_FOUND, 'Entry not found');
        Node memory node = self.nodes[id];
        return (node.fromDate, node.toDate);
    }

    function getNotFoundCode() public pure returns (int)
    {
        return NOT_FOUND;
    }

    function getBookConflictCode() public pure returns (int)
    {
        return BOOK_CONFLICT;
    }

    function getInvalidCode() public pure returns (uint)
    {
        return INVALID;
    }
}
