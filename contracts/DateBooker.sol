pragma solidity ^0.5.0;

// TODO: introduce needed modifiers and require() in functions
//       checks on data[id]

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
  event Book(uint bid);
  event Cancellation(uint id, uint bid);
  event NoMoreSpace(uint id);
  event BookConflict(uint bid);
  event CancellationError(uint id, int errno);
  event Error(int errno);
  event Log(uint x); // Used for debugging

  // =============================================================
  // DEFINE
  // =============================================================

  struct Entry {
    uint prev;
    uint next;
    uint bid;
    bool used;
    // The dates below are seconds since epoch but will be interpreted as days.
    // Any second of a given day is enough to represent that day.
    uint from_date;
    uint to_date;
  }

  struct Data {
    uint start;
    uint end;
    uint capacity;
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
        from_date: 0,
        to_date: 0
      });
    }
    emit Register(nextId);
    return nextId++;
  }

  /**
   * Cancels the booking and returns its id.
   *
   * @param id      id used in register()
   * @param bid     booking id to be cancelled
   */
  function cancel(uint id, uint bid) public returns (int) {
    int idx = find_book(id, bid);
    if (idx < 0) {
      // Cannot remove in-existent entry
      emit CancellationError(id, NOT_FOUND);
      return NOT_FOUND;
    }
    Data storage _data = data[id];
    uint udx = uint(idx);
    Entry storage curr = _data.d[udx];
    if ( has_space(id) ) {
      _data.d[curr.prev].next = curr.next;
      _data.d[curr.next].prev = curr.prev;
      curr.next = _data.end;
      curr.prev = _data.d[_data.end].prev;
      _data.d[_data.d[_data.end].prev].next = udx;
      _data.d[_data.end].prev = udx;
    }
    curr.used = false;
    _data.end = udx;
    if (_data.end == _data.start) {
      _data.start = INVALID;
    }
    _data.size--;
    emit Cancellation(id, bid);
    return int(bid);
  }

  function book(uint id, uint from_date, uint nb_of_days) public returns (int) {
    require(nb_of_days > 0, 'Cannot have non-positive days.');
    // Check that there is space
    if ( !has_space(id) ) {
      emit NoMoreSpace(id);
      return NO_MORE_SPACE;
    }
    // Check that there are no date intersections
    from_date = timestamp_to_day(from_date);
    uint to_date = from_date + nb_of_days;
    int ret = find_book_with_intersecting_dates(id, from_date, to_date);
    if (ret >= 0) {
      emit BookConflict(uint(ret));
      return BOOK_CONFLICT;
    }
    // Set properties of new entry
    Data storage _data = data[id];
    _data.d[_data.end].to_date = to_date;
    _data.d[_data.end].from_date = from_date;
    _data.d[_data.end].bid = _data.size;
    _data.d[_data.end].used = true;

    if ( is_empty(id) ) {
      _data.start = _data.end;
    }
    _data.end = _data.d[_data.end].next;
    if (_data.end == _data.start) {
      _data.end = INVALID;
    }
    emit Book(_data.size);
    return int(_data.size++);
  }

  // =============================================================
  // CONSTANT FUNCTIONS
  // =============================================================

  function find_book_with_intersecting_dates(uint id, uint from_date, uint to_date) private view returns (int) {
    if (is_empty(id)) {
      return NOT_FOUND;
    }
    Data storage _data = data[id];
    uint i = _data.start;
    uint last = _data.d[_data.start].prev;
    while (i != last && (_data.d[i].used == false ||
        !dates_intersect(from_date, to_date, _data.d[i].from_date, _data.d[i].to_date))) {
      i = _data.d[i].next;
    }
    bool b = _data.d[i].used && dates_intersect(from_date, to_date, _data.d[i].from_date, _data.d[i].to_date);
    return (b) ? int(i): NOT_FOUND;
  }

  function find_book(uint id, uint bid) public view returns (int) {
    if ( is_empty(id) ) {
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

  function get_size(uint id) view public returns (uint) {
    return data[id].size;
  }

  function get_capacity(uint id) view public returns (uint) {
    return data[id].capacity;
  }

  function is_empty(uint id) view public returns (bool) {
    return data[id].start == INVALID;
  }

  function has_space(uint id) view public returns (bool) {
    return data[id].end != INVALID;
  }

  function get_dates(uint id, uint bid) public view returns (uint from_date, uint to_date) {
    int idx = find_book(id, bid);
    require(idx >= 0, 'Cannot get dates for non-present bid.');
    Entry storage entry = data[id].d[uint(idx)];
    return (day_to_timestamp(entry.from_date), day_to_timestamp(entry.to_date));
  }

  function dates_intersect(uint from1, uint to1, uint from2, uint to2) private pure returns (bool) {
    require(from1 < to1 && from2 < to2, 'from date must be smaller than to date');
    return (from2 < to1 && from2 >= from1) || (to2 <= to1 && to2 > from1);
  }

  function timestamp_to_day(uint timestamp) private pure returns (uint) {
    return uint(timestamp / 86400);
  }

  function day_to_timestamp(uint day) private pure returns (uint) {
    return uint(day * 86400);
  }

}