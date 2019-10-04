pragma solidity ^0.5.0;

library BasicBookerLib {
  struct Node {
    uint fromDate;
    uint toDate;
    uint bid;
  }

  struct Storage {
    mapping (uint => Node) nodes;
    uint[] nodeList;
  }

  int public constant NOT_FOUND = -1;
  int public constant BOOK_CONFLICT = -2;
  uint public constant INVALID = 9999999; // FIXME: want to change this?

  event Cancelled(uint bid);
  event Booked(uint bid);
  event Conflict();
  event Error(string msg);
  event Log(uint from, uint to);

  /// Inserts a booking entry if date range [fromDate; toDate] does not intersect with existing ones
  function book(Storage storage self, uint fromDate, uint toDate) public returns (int)
  {
    // Check Intersection
    int res = checkIntersect(self, fromDate, toDate);
    if (res >= 0) {
      emit Conflict();
      return BOOK_CONFLICT;
    }
    // Insert booking
    Node memory n = Node({
      fromDate: fromDate,
      toDate: toDate,
      bid: self.nodeList.length + 1
    });
    self.nodes[n.bid] = n;
    self.nodeList.push(n.bid);
    emit Booked(n.bid);
    return int(n.bid);
  }

  function cancel(Storage storage self, uint bid) public returns (int)
  {
      if (self.nodes[bid].bid != bid) {
          return NOT_FOUND;
      } else {
          delete self.nodes[bid];
          delete self.nodeList[bid];
          emit Cancelled(bid);
      }
  }

  function getDates(Storage storage self, uint bid) public view returns (uint fromDate, uint toDate)
  {
      return (self.nodes[bid].fromDate, self.nodes[bid].toDate);

  }

  /// Returns the index of the first date which interesects with provided date range [fromDate, toDate]
  /// otherwise returns -1
  function checkIntersect(Storage storage self, uint fromDate, uint toDate) private view returns (int)
  {
    for(uint i = 0; i < self.nodeList.length; i++) {
      Node memory node = self.nodes[self.nodeList[i]];
      if (node.bid == i + 1 && datesIntersect(fromDate, toDate, node.fromDate, node.toDate)) {
        return int(i);
      }
    }
    return NOT_FOUND;
  }

  function datesIntersect(uint from1, uint to1, uint from2, uint to2) private pure returns (bool)
  {
    require(from1 < to1 && from2 < to2, 'invalid date ranges provided to datesIntersect');
    return (from2 < to1 && from2 >= from1) || (to2 <= to1 && to2 > from1);
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