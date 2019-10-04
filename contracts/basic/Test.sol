pragma solidity ^0.5.0;

import './BasicBookerLib.sol';

contract EthBnBBase {

 struct Node {
    uint fromDate;
    uint toDate;
    uint bid;
  }
mapping (uint => Node) nodes;
uint[] nodeList;

  int public constant NOT_FOUND = -1;
  int public constant BOOK_CONFLICT = -2;
  uint public constant INVALID = 9999999; // FIXME: want to change this?

  event Cancelled(uint bid);
  event Booked(uint bid);
  event Conflict();
  event Error(string msg);
  event Log(uint from, uint to);

  /// Inserts a booking entry if date range [fromDate; toDate] does not intersect with existing ones
  function book(uint fromDate, uint toDate) public returns (int)
  {
    // Check Intersection
    int res = checkIntersect(fromDate, toDate);
    if (res >= 0) {
      emit Conflict();
      return BOOK_CONFLICT;
    }
    // Insert booking
    Node memory n = Node({
      fromDate: fromDate,
      toDate: toDate,
      bid: nodeList.length + 1
    });
    nodes[n.bid] = n;
    nodeList.push(n.bid);
    emit Booked(n.bid);
    return int(n.bid);
  }

  function cancel(uint bid) public returns (int)
  {
      if (nodes[bid].bid != bid) {
          return NOT_FOUND;
      } else {
          delete nodes[bid];
          delete nodeList[bid];
          emit Cancelled(bid);
      }
  }

  function getDates(uint bid) public view returns (uint fromDate, uint toDate)
  {
      return (nodes[bid].fromDate, nodes[bid].toDate);

  }

  /// Returns the index of the first date which interesects with provided date range [fromDate, toDate]
  /// otherwise returns -1
  function checkIntersect(uint fromDate, uint toDate) private view returns (int)
  {
    for(uint i = 0; i < nodeList.length; i++) {
      Node memory node = nodes[nodeList[i]];
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
    function test() public {
        int bid1 = book(0, 1);
        int bid2 = book(1, 2);
        int bid3 = book(2, 3);
        int bid4 = book(3, 4);

        cancel(uint(bid1));
        cancel(uint(bid2));
        cancel(uint(bid3));
        cancel(uint(bid4));

        bid1 = book(0, 1);
        bid2 = book(1, 2);
        bid3 = book(2, 3);
        bid4 = book(3, 4);
    }

}