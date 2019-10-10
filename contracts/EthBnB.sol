pragma solidity ^0.5.0;

import './OptimBookerLib.sol';

/**
 *
 */
contract EthBnB {

  uint constant SECONDS_PER_DAY = 3600 * 24;

  using OptimBookerLib for OptimBookerLib.Storage;

  enum Country {
    AF, AX, AL, DZ, AS, AD, AO, AI, AG, AR, AM, AW, AU, AT, AZ, BS, BH,
    BD, BB, BY, BE, BZ, BJ, BM, BT, BO, BA, BW, BV, BR, VG, BN, BG, BF,
    BI, TC, KH, CM, CA, CV, KY, CF, TD, CL, CN, CX, CC, CO, KM, CG, CD,
    CK, CR, CI, HR, CU, CY, CZ, DK, DJ, DM, DO, EC, EG, SV, GB, GQ, ER,
    EE, ET, EU, FK, FO, FJ, FI, FR, GF, PF, TF, GA, GM, GE, DE, GH, GI,
    GR, GL, GD, GP, GU, GT, GW, GN, GY, HT, HM, HN, HK, HU, IS, IN, IO,
    ID, IR, IQ, IE, IL, IT, JM, JP, JO, KZ, KE, KI, KW, KG, LA, LV, LB,
    LS, LR, LY, LI, LT, LU, MO, MK, MG, MW, MY, MV, ML, MT, MH, MQ, MR,
    MU, YT, MX, FM, MD, MC, MN, ME, MS, MA, MZ, NA, NR, NP, AN, NL, NC,
    PG, NZ, NI, NE, NG, NU, NF, KP, MP, NO, OM, PK, PW, PS, PA, PY, PE,
    PH, PN, PL, PT, PR, QA, RE, RO, RU, RW, SH, KN, LC, PM, VC, WS, SM,
    GS, ST, SA, SN, CS, RS, SC, SL, SG, SK, SI, SB, SO, ZA, KR, ES, LK,
    SD, SR, SJ, SZ, SE, CH, SY, TW, TJ, TZ, TH, TL, TG, TK, TO, TT, TN,
    TR, TM, TV, UG, UA, AE, US, UY, UM, VI, UZ, VU, VA, VE, VN, WF, EH,
    YE, ZM, ZW
  }

  struct Listing {

    uint lid;

    address owner;

    uint price;

    string location;

    Country country;

    /** Bookings for the given listing */
    mapping(uint => Booking) bookings;

    uint256 balance;

    /**  */
    OptimBookerLib.Storage booker;

    string imageCID;
    string imageCIDSource;
  }

  struct Account {
    address payable owner;
    string name;
    uint dateCreated;
    /**
     * Account's average rating (out of 5) can be computed as
     * totalScore / totalRatings
     */
    uint totalScore;
    uint nRatings;
  }

  struct Booking {
    uint bid;
    uint lid;
    address guestAddr;
    address hostAddr;

    /**
     * Rating assigned to the owner by the guest
     * defaults to 0 which means nothing was set
     */
    uint ownerRating;
    /**
     * Rating assigned to the guest by the owner
     * defaults to 0 which means nothing was set
     */
    uint guestRating;

    /**
     * When a booking is made, the listing balance (staked by the host)
     * along with the value staked by the guest are added to the balance here.
     * The listing balance is obviously decreased.
     */
    uint256 balance;
  }

  // =======================================================================
  // MEMBER VARIABLES
  // =======================================================================

  event Log(string functionName, string msg);
  event Error(int code);

  // Account events
  event CreateAccountEvent(address from);
  event UpdateAccountEvent(address from);
  event DeleteAccountEvent(address from);
  // Listing events
  event CreateListingEvent(address from, uint lid);
  event UpdateListingEvent(address from, uint lid);
  event DeleteListingEvent(address from, uint lid);
  // Booking events
  event BookingComplete(address from, uint lid, uint bid);
  event BookingCancelled(address from, uint lid, uint bid);

  event RatingComplete(address from, uint lid, uint bid, uint stars);

  /**
   * Listings will have incrementing Ids starting from 1
   */
  uint nextListingId = 1;

  /**
   * Bookings will have incrementing Ids starting from 1
   */
  uint nextBookingId = 1;

  /**
   * Store all created listings
   * note that these are also stored in each Account.
   */
  mapping(uint => Listing) listings;

  /**
   * Stores created accounts
   */
  mapping(address => Account) accounts;

  // =======================================================================
  // FUNCTIONS
  // =======================================================================

  modifier accountExists(address owner) {
    require(accounts[owner].owner == owner);
    _;
  }

  function createAccount(string memory name) public {
    accounts[msg.sender] = Account({
      owner : msg.sender,
      name : name,
      dateCreated : now,
      totalScore: 0,
      nRatings: 0
    });
    emit CreateAccountEvent(msg.sender);
  }

  function hasAccount() public view returns (bool) {
    return accounts[msg.sender].owner == msg.sender;
  }

  function getAccountAll(address owner) public accountExists(owner) view
    returns (string memory name, uint dateCreated, uint totalScore, uint nRatings) {
      Account memory account = accounts[owner];
      return (account.name, account.dateCreated, account.totalScore, account.nRatings);
    }

  modifier listingExists(uint lid) {
    require(listings[lid].lid == lid, 'No such listing found');
    _;
  }

  modifier onlyListingHost(uint lid) {
    require(listings[lid].owner == msg.sender, 'Only listing host can change it');
    _;
  }

  function getListingAll(uint lid) public listingExists(lid) view
    returns (address owner, uint price, string memory location, Country country, uint256 balance,
      string memory imageCID, string memory imageCIDSource) {
      Listing memory l = listings[lid];
      return (l.owner, l.price, l.location, l.country, l.balance, l.imageCID, l.imageCIDSource);
    }

  /**
   * Creates a new listing for the message sender
   * and returns the Id of the created listing
   *
   * When the listing create the smart-contract will have had the 2xprice amount
   * added to its balance.
   */
  function createListing(Country country, string memory location, uint price)
    public payable {
        require(hasAccount(), 'Must have an account before creating a listing');
        // Note: enforce a maximum number of listings per user?
        listings[nextListingId] = Listing({
          lid : nextListingId,
          owner: msg.sender,
          country: country,
          location: location,
          price: price,
          balance: msg.value,
          imageCID: '',
          imageCIDSource: '',
          booker: OptimBookerLib.Storage({
            nextPos: 0
          })
        });
        listings[nextListingId].booker.initialise();
        emit CreateListingEvent(msg.sender, nextListingId++);
  }

  /**
   * Book a listing
   *
   * @param lid          id of the listing to be booked
   * @param fromDate     start date of the booking in seconds
   * @param nbOfDays     number of days for which the booking will be made
   */
  function bookListing(uint lid, uint fromDate, uint nbOfDays)
    public payable listingExists(lid) {
      // TODO: cap the number of booked days to 30 or so
      require(hasAccount(), 'Guest must have an account before booking');
      Listing storage listing = listings[lid];
      address payable guest = msg.sender;
      uint256 stake = 2 * listing.price * nbOfDays;
      uint toDate = fromDate + nbOfDays * SECONDS_PER_DAY;
      require(listing.owner != guest, 'Owner cannot book their own listing');

      // Ensure both guest and host have staked the same
      require(msg.value >= stake, 'Guest must stake twice the price');
      require(listing.balance >= stake, 'Listing must have stake amount in its balance');

      // Try to book.
      // If successful, create a booking event with the balance amount
      // If unsuccessful, refund the stake to guest
      int res = listing.booker.book(nextBookingId++, fromDate, toDate);
      if (res >= 0) {
        uint bid = uint(res);
        // Save the booking
        listing.bookings[bid] = Booking({
          bid: bid,
          lid: lid,
          hostAddr: listings[lid].owner,
          guestAddr: guest,
          ownerRating: 0,
          guestRating: 0,
          // Add the amounts staked by the guest
          // and by the host to the booking balance
          balance: 2 * stake
        });
        // Decrement the listing balance
        listing.balance -= stake;
        // Refund any excess to the guest
        guest.transfer(msg.value - stake);
        emit BookingComplete(msg.sender, lid, bid);
      } else {
        // Refund all Ether provided if the booking failed
        guest.transfer(msg.value);
      }
    }

  function setListing(uint lid, uint price, string memory location, Country country)
    public listingExists(lid) onlyListingHost(lid) {
      Listing storage listing = listings[lid];
      listing.location = location;
      listing.price = price;
      listing.country = country;
      emit UpdateListingEvent(msg.sender, lid);
  }

  function setListingImage(uint lid, string memory cid, string memory cidSource)
    public listingExists(lid) onlyListingHost(lid) {
      Listing storage listing = listings[lid];
      listing.imageCID = cid;
      listing.imageCIDSource = cidSource;
      emit UpdateListingEvent(msg.sender, lid);
  }

  /**
   * Returns the listing balance to its owner and deletes the listing
   *
   * Only if there are no active bookings.
   *
   * @param lid   id of the listing to be deleted
   */
  function deleteListing(uint lid) public listingExists(lid) onlyListingHost(lid) {
    // Check that there are no active bookings before we proceed
    Listing storage listing = listings[lid];
    require(false == listing.booker.hasActiveBookings(), 'Cannot delete listing with active bookings');

    // Return listing balance to its owner
    uint toReturn = listing.balance;
    listing.balance = 0;
    accounts[listing.owner].owner.transfer(toReturn);

    // Delete listing's storage
    delete listings[lid];
    emit DeleteListingEvent(msg.sender, lid);
  }

  function depositIntoListing(uint lid)
    public payable
    listingExists(lid)
    onlyListingHost(lid)
    {
      Listing storage listing = listings[lid];
      listing.balance += msg.value;
  }

  function withdrawFromListing(uint lid, uint amount)
    public
    listingExists(lid)
    onlyListingHost(lid)
    {
      Listing storage listing = listings[lid];
      require(amount <= listing.balance, 'Cannot withdraw more than listing balance');
      listing.balance -= amount;
      accounts[listings[lid].owner].owner.transfer(amount);
  }

  /**
   * Invoked by the guest of a booking after the booking end,
   * confirming the host fulfilled their obligations, and
   * releasing funds held in escrow.
   *
   * @param lid       id of the booked listing
   * @param bid       id of the booking
   */
  function fulfilBooking(uint lid, uint bid) public listingExists(lid) {
    Booking storage booking = listings[lid].bookings[bid];
    address guest = booking.guestAddr;
    address host = booking.hostAddr;
    (, uint toDate) = getBookingDates(lid, bid);
    require(msg.sender == guest , 'Only guest can call fulfilBooking');
    require(toDate <= now, 'Cannot fulfil booking before end date');

    // Fund Release:
    //    Guest receives:    booking.balance
    //    Listing receives:  2 x booking.balance
    //    Owner:             booking.balance
    //
    uint256 amount = booking.balance / 4;
    booking.balance = 0;
    listings[lid].balance += amount * 2;
    accounts[host].owner.transfer(amount);
    accounts[guest].owner.transfer(amount);
  }

  /**
   * Rate the booking 1-5 stars
   *
   * The function checks the msg.sender and validates
   * they were either owner or guest in the booking.
   *
   * If they were not, a PermissionDenied event is emitted.
   *
   * @param bid         the identifier for their booking, this
   *                    coupled with msg.sender is enough to determine
   *                    the person being rated
   * @param stars       unsigned integer between 1 and 5, anything else
   *                    will emit an error
   */
  function rate(uint lid, uint bid, uint stars) public {
    require(listings[lid].lid == lid && listings[lid].bookings[bid].bid == bid, 'No such listing or booking');
    require(stars >= 1 && stars <= 5, 'Stars arg must be in [1,5]');
    Booking storage booking = listings[lid].bookings[bid];
    require(booking.guestAddr == msg.sender || booking.hostAddr == msg.sender, 'Sender not participated in booking');
    (, uint toDate) = getBookingDates(lid, bid);
    require(toDate <= now, 'Cannot rate a booking before it ends');
    if (booking.guestAddr == msg.sender) {
      // The guest is rating the owner
      require(booking.ownerRating == 0, 'Owner already rated, cannot re-rate');
      // Assign the rating and adjust their account
      booking.ownerRating = stars;
      accounts[booking.hostAddr].totalScore += stars;
      accounts[booking.hostAddr].nRatings++;
    }
    else if (booking.hostAddr == msg.sender) {
      // The owner is rating the guest
      require(booking.guestRating == 0, 'Guest already rated, cannot re-rate');
      // Adding the rating and adjust their account
      booking.guestRating = stars;
      accounts[booking.guestAddr].totalScore += stars;
      accounts[booking.guestAddr].nRatings++;
    }
    emit RatingComplete(msg.sender, lid, bid, stars);
  }

  /**
   * Cancel a booking
   *
   * @param lid           id of the listing to be cancelled
   * @param bid           id of the booking to be cancelled
   */
  function cancelBooking(uint lid, uint bid) public {
    Listing storage listing = listings[lid];
    require(
      msg.sender == listing.bookings[bid].hostAddr ||
      msg.sender == listing.bookings[bid].guestAddr,
      'Only Guest or Host can cancel a booking'
      );
    int res = listing.booker.cancel(bid);
    if (res >= 0) {
      emit BookingCancelled(msg.sender, lid, bid);
    }
  }

  function getBookingDates(uint lid, uint bid) public view returns (uint fromDate, uint toDate) {
    require(listings[lid].lid == lid, 'Listing does not exist');
    return listings[lid].booker.getDates(bid);
  }

  function checkListingId(uint lid) view private {
    // Make sure account exists
    require(accounts[msg.sender].owner == msg.sender);
    // Make sure listing exists and properly associated with account
    require(listings[lid].lid != 0, 'No such listing found');
    require(listings[lid].owner == msg.sender, 'Only the owner of a listing make changes to it');
  }
}