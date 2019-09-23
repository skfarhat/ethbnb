
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
    // uint head;
    uint junk;
    mapping (uint => Node) nodes;
}

event Log(uint from, uint to);
event BookingConflict();
event BookingError(string msg);


/// The list is empty if the HEAD node points to itself
function isEmpty(Storage storage self) public view returns (bool) {
    return self.nodes[HEAD].next == HEAD;
}

/// Returns the next available position and updates it
function useNextPos(Storage storage self) public returns (uint pos) {
    if (self.nextPos == HEAD) {
        self.nextPos = HEAD + 2;
        return HEAD + 1;
    } else {
        return self.nextPos++;
    }
}

function _createLink(Storage storage self, uint fromNode, uint toNode) private {
    self.nodes[fromNode].next = toNode;
}

function _printAll(Storage storage self) public {
    uint curr = self.nodes[HEAD].next;
    while (curr != HEAD) {
        emit Log(self.nodes[curr].fromDate, self.nodes[curr].toDate);
        curr = self.nodes[curr].next;
    }
}

function _printJunk(Storage storage self) public {
    uint curr = self.nodes[JUNK].next;
    while (curr != HEAD) {
        emit Log(self.nodes[curr].fromDate, self.nodes[curr].toDate);
        curr = self.nodes[curr].next;
    }
}

// Adds the provided node to junk
function addJunk(Storage storage self, uint node) private {
    require(node != JUNK, 'Cannot add provided node to Junk');
    if (self.junk == 0 /* un-initialised */) {
        self.junk = JUNK;
    }
    _createLink(self, node, self.junk);
    self.junk = node;
}

function popJunk(Storage storage self) private {
    require(self.junk == 0 || self.junk != JUNK, 'Nothing to pop from Junk');
    self.junk = self.nodes[self.junk].next;
}

/// Removes node from the list. Requires the prevNode be provided.
function removeNode(Storage storage self, uint node, uint prevNode) private {
    _createLink(self, prevNode, self.nodes[node].next);
    addJunk(self, node);
}

function _newNode(Storage storage self, uint prevNode, uint nextNode, uint bid, uint fromDate, uint toDate) private {
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

/// Invokes _newNode and returns the bid of the created node
/// Increments self.nextBid
function newBook(Storage storage self, uint prevNode, uint nextNode, uint fromDate, uint toDate) private returns (uint) {
    _newNode(self, prevNode, nextNode,self.nextBid++, fromDate, toDate);
    return self.nextBid - 1;
}

// FIXME: bids are not updated yet
function book(Storage storage self, uint fromDate, uint toDate) public returns (uint) {
    // FIXME: uncomment the below
    // if (fromDate <= now) {
    //     emit BookingError("Cannot book in the past");
    // }
    if (isEmpty(self)) {
        return newBook(self, HEAD, HEAD, fromDate, toDate);
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
                return newBook(self, prev, curr, fromDate, toDate);
            } else {
                emit BookingConflict();
            }
        }
        return newBook(self, prev, HEAD, fromDate, toDate);
    }
}

function cancel(Storage storage self, uint bid) public returns (int) {
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
