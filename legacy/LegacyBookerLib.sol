pragma solidity ^0.5.0;

// TODO: introduce needed modifiers and require() in functions
//       checks on data[id]

// FIXME: consider introducing a cleanup function that cancels inactive bookings.

library LegacyBookerLib {

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
  event Cancelled(uint id, uint bid);
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
    /** Begins at zero */
    uint bid;
    /**
     * Field used to mark that the Entry is active.
     * False implies we have an Entry that is not in use
     * Technically we can check that bid is not zero, and set bid to zero when
     * the entry becomes inactive, but this is more readable.
     */
    bool used;
    /**
     * The dates below are seconds since epoch but will be interpreted as days.
     * Any second of a given day is enough to represent that day.
     */
    uint fromDate;
    uint toDate;
    /** Address of the account that created this entry */
    address owner;
  }

  struct Data {
    uint start;
    uint end;
    uint capacity;
    /** Counts the number of bookings that have been made but not cancelled */
    uint size;
    mapping(uint => Entry) d;
  }

  struct BookerStorage {
      uint nextId;
      mapping(uint => Data) data;
  }


  // =============================================================
  // STATE CHANGING FUNCTIONS
  // =============================================================

  function register(BookerStorage storage self, uint capacity) public returns (uint) {
    require(capacity > 0, "Capacity must be greater than zero");
    self.data[self.nextId] = Data({
      start: INVALID,
      end: 0,
      size: 0,
      capacity: capacity
    });
    // Initialise entries in the d mapping
    for (uint i = 0; i < capacity; i++) {
      self.data[self.nextId].d[i] = Entry({
        prev: (i == 0) ? capacity - 1 : (i - 1) % capacity,
        next: (i + 1) % capacity,
        bid: INVALID,
        used: false,
        fromDate: 0,
        toDate: 0,
        owner: address(0)
      });
    }
    emit Register(self.nextId);
    return self.nextId++;
  }

  function book(BookerStorage storage self, uint id, uint fromDate, uint toDate)
                public returns (int) {
    require(fromDate < toDate, 'Invalid dates');

    if ( !hasSpace(self, id) ) {
      emit NoMoreSpace(id);
      return NO_MORE_SPACE;
    }
    // Check that there are no date intersections
    int ret = findBookWithIntersectingDates(self, id, fromDate, toDate);
    if (ret >= 0) {
      emit BookConflict(id, uint(ret));
      return BOOK_CONFLICT;
    }
    // Set properties of new entry
    Data storage _data = self.data[id];
    _data.d[_data.end].toDate = toDate;
    _data.d[_data.end].fromDate = fromDate;
    _data.d[_data.end].bid = _data.size;
    _data.d[_data.end].used = true;
    _data.d[_data.end].owner = msg.sender;

    if ( isEmpty(self, id) ) {
      _data.start = _data.end;
    }
    _data.end = _data.d[_data.end].next;
    if (_data.end == _data.start) {
      _data.end = INVALID;
    }
    emit BookSuccess(id, _data.size);
    return int(_data.size++);
  }


  /**
   * Cancels the booking and returns its id.
   *
   *
   * @param id          id used in register()
   * @param bid         booking id to be cancelled
   */
  function cancel(BookerStorage storage self, uint id, uint bid) public returns (int) {
    int idx = findBook(self, id, bid);
    if (idx < 0) {
      emit CancellationError(id, NOT_FOUND);
      return NOT_FOUND;
    }
    Data storage _data = self.data[id];
    uint udx = uint(idx);
    Entry storage curr = _data.d[udx];
    // Check permission
    if (curr.owner != msg.sender) {
      emit PermissionDenied(id, bid);
    }
    if ( hasSpace(self, id) ) {
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
    emit Cancelled(id, bid);
    return int(bid);
  }

  // =============================================================
  // CONSTANT FUNCTIONS
  // =============================================================

  function findBookWithIntersectingDates(BookerStorage storage self, uint id, uint fromDate, uint toDate)
                                            private view returns (int) {
    if (isEmpty(self, id)) {
      return NOT_FOUND;
    }
    Data storage _data = self.data[id];
    uint i = _data.start;
    uint last = _data.d[_data.start].prev;
    while (i != last && (_data.d[i].used == false ||
        !datesIntersect(fromDate, toDate, _data.d[i].fromDate, _data.d[i].toDate))) {
      i = _data.d[i].next;
    }
    bool b = _data.d[i].used && datesIntersect(fromDate, toDate, _data.d[i].fromDate, _data.d[i].toDate);
    return (b) ? int(i): NOT_FOUND;
  }

  function findBook(BookerStorage storage self, uint id, uint bid) public view returns (int) {
    if ( isEmpty(self, id) ) {
      return NOT_FOUND;
    }
    Data storage _data = self.data[id];
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
  function getActiveBookingsCount(BookerStorage storage self, uint id) public view returns (uint count) {
    Data storage _data = self.data[id];
    uint i = _data.start;
    uint j = 0;
    uint last = _data.d[i].prev;
    uint size = getSize(self, id);
    while (j < size) {
      if (_data.d[i].toDate > now)
        count++;
      i = _data.d[i].next;
      j++;
    }
    return count;
  }

  function getSize(BookerStorage storage self, uint id) public view returns (uint) {
    return self.data[id].size;
  }

  function getCapacity(BookerStorage storage self, uint id) public view returns (uint) {
    return self.data[id].capacity;
  }

  function isEmpty(BookerStorage storage self, uint id) public view returns (bool) {
    return self.data[id].start == INVALID;
  }

  function hasSpace(BookerStorage storage self, uint id) public view  returns (bool) {
    return self.data[id].end != INVALID;
  }

  function getDates(BookerStorage storage self, uint id, uint bid) public view returns (uint fromDate, uint toDate) {
    int idx = findBook(self, id, bid);
    require(idx >= 0, 'Cannot get dates for non-present bid.');
    Entry memory entry = self.data[id].d[uint(idx)];
    return (entry.fromDate, entry.toDate);
  }

  function datesIntersect(uint from1, uint to1, uint from2, uint to2) private pure returns (bool) {
    require(from1 < to1 && from2 < to2, 'from date must be smaller than to date');
    return (from2 < to1 && from2 >= from1) || (to2 <= to1 && to2 > from1);
  }

  function getNotFoundCode ()       public pure returns (int)   { return NOT_FOUND; }
  function getBookConflictCode ()   public pure returns (int)   { return BOOK_CONFLICT; }
  function getNoMoreSpaceCode ()    public pure returns (int)   { return NO_MORE_SPACE; }
  function getInvalidCode ()        public pure returns (uint)  { return INVALID; }

}