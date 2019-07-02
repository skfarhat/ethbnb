pragma solidity ^0.5.0;

// TODO: introduce needed modifiers and require() in functions
//       checks on data[id]

// FIXME: consider introducing a cleanup function that cancels inactive bookings.

contract DateBooker {

  // =============================================================
  // CONSTANTS
  // =============================================================

  int public constant NOT_FOUND = -1;
  int public constant BOOK_CONFLICT = -2;
  int public constant NO_MORE_SPACE = -3;
  uint public constant INVALID = 9999999;

  // =============================================================
  // EVENTS
  // =============================================================

  event Register(uint id);
  event Cancellation(uint id, uint bid);
  event NoMoreSpace(uint id);
  event BookSuccess(uint id, uint bid);
  event BookConflict(uint id, uint bid);
  event PermissionDenied(uint id, uint bid);
  event CancellationError(uint id, int errno);
  event Error(int errno);
  event Log(uint x); // Used for debugging

  // =============================================================
  // DEFINE
  // =============================================================

  struct Entry {
    uint prev;
    uint next;
    // Begins at zero
    uint bid;
    // Field used to mark that the Entry is active.
    // False implies we have an Entry that is not in use
    // Technically we can check that bid is not zero, and set bid to zero when
    // the entry becomes inactive, but this is more readable.
    bool used;
    // The dates below are seconds since epoch but will be interpreted as days.
    // Any second of a given day is enough to represent that day.
    uint fromDate;
    uint toDate;
    // Address of the account that created this entry
    address owner;
  }

  struct Data {
    uint start;
    uint end;
    uint capacity;
    // Counts the number of bookings that have been made but not cancelled
    uint size;
    mapping(uint => Entry) d;
  }

  uint nextId = 1;

  mapping(uint => Data) private data;

  // =============================================================
  // STATE CHANGING FUNCTIONS
  // =============================================================

  function register(uint capacity) public returns (uint) {
    require(capacity > 0, "Capacity must be greater than zero");
    data[nextId] = Data({
      start: INVALID,
      end: 0,
      size: 0,
      capacity: capacity
    });
    // Initialise entries in the d mapping
    for (uint i = 0; i < capacity; i++) {
      data[nextId].d[i] = Entry({
        prev: (i == 0) ? capacity - 1 : (i - 1) % capacity,
        next: (i + 1) % capacity,
        bid: INVALID,
        used: false,
        fromDate: 0,
        toDate: 0,
        owner: address(0)
      });
    }
    emit Register(nextId);
    return nextId++;
  }

  /**
   * Cancels the booking and returns its id.
   *
   *
   * @param id          id used in register()
   * @param bid         booking id to be cancelled
   */
  function cancel(uint id, uint bid) public returns (int) {
    int idx = findBook(id, bid);
    if (idx < 0) {
      emit CancellationError(id, NOT_FOUND);
      return NOT_FOUND;
    }
    Data storage _data = data[id];
    uint udx = uint(idx);
    Entry storage curr = _data.d[udx];
    // Check permission
    if (curr.owner != tx.origin) {
      emit PermissionDenied(id, bid);
    }
    if ( hasSpace(id) ) {
      _data.d[curr.prev].next = curr.next;
      _data.d[curr.next].prev = curr.prev;
      curr.next = _data.end;
      curr.prev = _data.d[_data.end].prev;
      _data.d[_data.d[_data.end].prev].next = udx;
      _data.d[_data.end].prev = udx;
    }
    curr.owner = address(0);
    curr.used = false;
    _data.end = udx;
    if (_data.end == _data.start) {
      _data.start = INVALID;
    }
    _data.size--;
    emit Cancellation(id, bid);
    return int(bid);
  }

  function book(uint id, uint fromDate, uint nbOfDays) public returns (int) {
    require(nbOfDays > 0, 'Cannot have non-positive days');
    if ( !hasSpace(id) ) {
      emit NoMoreSpace(id);
      return NO_MORE_SPACE;
    }
    // Check that there are no date intersections
    uint toDate = dayToTimestamp(timestampToDay(fromDate) + nbOfDays);
    emit Log(toDate);
    int ret = findBookWithIntersectingDates(id, fromDate, toDate);
    if (ret >= 0) {
      emit BookConflict(id, uint(ret));
      return BOOK_CONFLICT;
    }
    // Set properties of new entry
    Data storage _data = data[id];
    _data.d[_data.end].toDate = toDate;
    _data.d[_data.end].fromDate = fromDate;
    _data.d[_data.end].bid = _data.size;
    _data.d[_data.end].used = true;
    _data.d[_data.end].owner = tx.origin;

    if ( isEmpty(id) ) {
      _data.start = _data.end;
    }
    _data.end = _data.d[_data.end].next;
    if (_data.end == _data.start) {
      _data.end = INVALID;
    }
    emit BookSuccess(id, _data.size);
    return int(_data.size++);
  }

  // =============================================================
  // CONSTANT FUNCTIONS
  // =============================================================

  function getNow() public view returns (uint) {
      return now;
  }

  function findBookWithIntersectingDates(uint id, uint fromDate, uint toDate) private view returns (int) {
    if (isEmpty(id)) {
      return NOT_FOUND;
    }
    Data storage _data = data[id];
    uint i = _data.start;
    uint last = _data.d[_data.start].prev;
    while (i != last && (_data.d[i].used == false ||
        !datesIntersect(fromDate, toDate, _data.d[i].fromDate, _data.d[i].toDate))) {
      i = _data.d[i].next;
    }
    bool b = _data.d[i].used && datesIntersect(fromDate, toDate, _data.d[i].fromDate, _data.d[i].toDate);
    return (b) ? int(i): NOT_FOUND;
  }

  function findBook(uint id, uint bid) public view returns (int) {
    if ( isEmpty(id) ) {
      return NOT_FOUND;
    }
    Data storage _data = data[id];
    uint i = _data.start;
    uint last = _data.d[i].prev;
    while (_data.d[i].bid != bid && i != last) {
      i = _data.d[i].next;
    }
    return (_data.d[i].bid == bid) ? int(i) : NOT_FOUND;
  }

  /**
   * Returns the number of bookings for which the end date is after "now"
   */
  function getActiveBookingsCount(uint id) public view returns (uint count) {
    Data storage _data = data[id];
    uint i = _data.start;
    uint j = 0;
    uint last = _data.d[i].prev;
    uint size = getSize(id);
    while (j < size) {
      if (_data.d[i].toDate > now)
        count++;
      i = _data.d[i].next;
      j++;
    }
    return count;
  }

  function getSize(uint id) view public returns (uint) {
    return data[id].size;
  }

  function getCapacity(uint id) view public returns (uint) {
    return data[id].capacity;
  }

  function isEmpty(uint id) view public returns (bool) {
    return data[id].start == INVALID;
  }

  function hasSpace(uint id) view public returns (bool) {
    return data[id].end != INVALID;
  }

  function getDates(uint id, uint bid) public view returns (uint fromDate, uint toDate) {
    int idx = findBook(id, bid);
    require(idx >= 0, 'Cannot get dates for non-present bid.');
    Entry storage entry = data[id].d[uint(idx)];
    return (entry.fromDate, entry.toDate);
  }

  function datesIntersect(uint from1, uint to1, uint from2, uint to2) private pure returns (bool) {
    require(from1 < to1 && from2 < to2, 'from date must be smaller than to date');
    return (from2 < to1 && from2 >= from1) || (to2 <= to1 && to2 > from1);
  }

  function timestampToDay(uint timestamp) private pure returns (uint) {
    return uint(timestamp / 86400);
  }

  function dayToTimestamp(uint day) private pure returns (uint) {
    return uint(day * 86400);
  }

}