
library LinkedList {

struct Node {
    uint fromDate;
    uint toDate;
    uint bid;
    uint next;
}

uint constant HEAD = 0;
uint constant JUNK = 999999; // We assume there won't be that many bookings


struct Storage {
    uint nextPos;
    uint nextBid;
    mapping (uint => Node) nodes;
}

event Booking(uint bid);
event Log(uint from, uint to);
event BookingConflict();
event BookingError(string msg);


/// The list is empty if the HEAD node points to itself
function isEmpty(Storage storage self) public view returns (bool)
{
    return self.nodes[HEAD].next == HEAD;
}

function _createLink(Storage storage self, uint fromNode, uint toNode) private
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

// Adds the provided node to junk
function addJunk(Storage storage self, uint node) private
{
    require(node != JUNK, 'Cannot add provided node to Junk');
    if (junkNotInitialised(self)) {
        self.nodes[JUNK].next = JUNK;
    }
    _createLink(self, node, self.nodes[JUNK].next);
    _createLink(self, JUNK, node);
}

modifier junkNotEmpty(Storage storage self)
{
    require(!junkIsEmpty(self));
    _;
}

/// Pops the junk node at head of list and returns its index
function popJunk(Storage storage self) private
  junkNotEmpty(self)
  returns (uint)
{
    uint ret = self.nodes[JUNK].next;
    _createLink(self, JUNK, self.nodes[ret].next);
    return ret;
}

/// Removes node from the list. Requires the prevNode be provided.
function removeNode(Storage storage self, uint node, uint prevNode) private
{
    _createLink(self, prevNode, self.nodes[node].next);
    addJunk(self, node);
}

/// Returns the next available position and updates it
function useNextPos(Storage storage self) public returns (uint pos)
{
    if (junkIsEmpty(self)) {
        if (self.nextPos == HEAD) {
            self.nextPos = HEAD + 2;
            return HEAD + 1;
        } else {
            return self.nextPos++;
        }
    } else {
        // Recycle node
        return popJunk(self);
    }
}

function _newNode(Storage storage self, uint prevNode, uint nextNode, uint bid, uint fromDate, uint toDate) private
{
    uint nextPos = useNextPos(self);
    Node memory n = Node({
        fromDate: fromDate,
        toDate: toDate,
        bid: bid,
        next: nextNode
    });
    _createLink(self, prevNode, nextPos);
    _createLink(self, nextPos, nextNode);  // redundant, but there for readability
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
    _newNode(self, prevNode, nextNode, bid, fromDate, toDate);
    emit Booking(bid);
    return bid;
}


function book(Storage storage self, uint fromDate, uint toDate) public returns (int)
{
    // FIXME: uncomment the below
    // if (fromDate <= now) {
    //     emit BookingError("Cannot book in the past");
    // }
    if (isEmpty(self)) {
        return int(newBook(self, HEAD, HEAD, fromDate, toDate));
    } else {
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
                prev = curr;
                curr = self.nodes[curr].next;
            } else if (toDate <= x) {
                // TODO: self.freeJunk()
                return int(newBook(self, prev, curr, fromDate, toDate));
            } else {
                emit BookingConflict();
                return -1;
            }
        }
        return int(newBook(self, prev, HEAD, fromDate, toDate));
    }
}

function cancel(Storage storage self, uint bid) public returns (int)
{
    uint prev = HEAD;
    uint curr = self.nodes[prev].next;
    // Find node with matching bid, then remove it
    while (curr != HEAD) {
        if (self.nodes[curr].bid == bid) {
            removeNode(self, curr, prev);
            return int(curr);
        }
        prev = curr;
        curr = self.nodes[curr].next;
    }
    return -1;
}
}
