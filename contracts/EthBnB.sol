pragma solidity ^0.5.0;

// TODO: change listingId param to lid. Shorter, better.
import  "./DateBooker.sol";

/**
*
* Listings:
* ---------
* Created listings are stored in the their account's struct as well as in the
* contract's listings mapping.
*
*
* A calendar day is the minimum duration for a Booking
*/
contract EthBnB {

  enum Country {
    AF, AX, AL, DZ, AS, AD, AO, AI, AG, AR, AM, AW, AU, AT, AZ, BS, BH, BD, BB, BY, BE, BZ, BJ, BM, BT, BO, BA, BW, BV, BR, VG, BN, BG, BF, BI, TC, KH, CM, CA, CV, KY, CF, TD, CL, CN, CX, CC, CO, KM, CG, CD, CK, CR, CI, HR, CU, CY, CZ, DK, DJ, DM, DO, EC, EG, SV, GB, GQ, ER, EE, ET, EU, FK, FO, FJ, FI, FR, GF, PF, TF, GA, GM, GE, DE, GH, GI, GR, GL, GD, GP, GU, GT, GW, GN, GY, HT, HM, HN, HK, HU, IS, IN, IO, ID, IR, IQ, IE, IL, IT, JM, JP, JO, KZ, KE, KI, KW, KG, LA, LV, LB, LS, LR, LY, LI, LT, LU, MO, MK, MG, MW, MY, MV, ML, MT, MH, MQ, MR, MU, YT, MX, FM, MD, MC, MN, ME, MS, MA, MZ, NA, NR, NP, AN, NL, NC, PG, NZ, NI, NE, NG, NU, NF, KP, MP, NO, OM, PK, PW, PS, PA, PY, PE, PH, PN, PL, PT, PR, QA, RE, RO, RU, RW, SH, KN, LC, PM, VC, WS, SM, GS, ST, SA, SN, CS, RS, SC, SL, SG, SK, SI, SB, SO, ZA, KR, ES, LK, SD, SR, SJ, SZ, SE, CH, SY, TW, TJ, TZ, TH, TL, TG, TK, TO, TT, TN, TR, TM, TV, UG, UA, AE, US, UY, UM, VI, UZ, VU, VA, VE, VN, WF, EH, YE, ZM, ZW
  }

  struct Listing {

    uint id;

    address owner;

    uint price;

    string location;

    Country country;

    // Every listing has its own DateBooker 'id' which allows
    // the DateBooker contract to setup the appropriate data structure
    // for storing booking information for that Listing.
    //
    // Field is set in createListing
    uint dbid;
    // Bookings for the given listing
    mapping(uint => Booking) bookings;
   }

  struct Account {
    address owner;
    string name;
    uint dateCreated;
    uint[] listingIds; // REVIEW: check if this is really needed and used
    // Account's average rating (out of 5) can be computed as
    // totalScore / totalRatings
    uint totalScore;
    uint nRatings;
  }

  struct Booking {
    uint bid;
    uint lid;
    address guestAddr;
    address hostAddr;
    // Rating assigned to the host by the guest
    // defaults to 0 which means nothing was set
    uint hostRating;
    // Rating assigned to the guest by the host
    // defaults to 0 which means nothing was set
    uint guestRating;
  }

  // =======================================================================
  // MEMBER VARIABLES
  // =======================================================================

  event Log(string functionName, string msg);

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
  event BookingConflict(address from, uint lid);
  event BookingNoMoreSpace(address from, uint lid);
  event BookingCancelled(address from, uint lid, uint bid);
  event BookingNotFound(address from, uint lid, uint bid);

  event RatingComplete(address from, uint bid, uint stars);

  uint public BOOKING_CAPACITY = 5;

  /** Listings will have incrementing Ids starting from 1 */
  uint nextListingId = 1;

  /** A list of all listing ids */
  uint[] listingIds;

  /** Reference to deployed smart-contract DateBooker initialised in constructor */
  DateBooker dateBooker;

  // Store all created listings
  // note that these are also stored in each Account.
  mapping(uint => Listing) listings;

  // Stores created accounts
  mapping(address => Account) accounts;

  // =======================================================================
  // FUNCTIONS
  // =======================================================================

  constructor(address dateBookerAddr) public {
    dateBooker = DateBooker(dateBookerAddr);
  }

  // ACCOUNT
  // -----------------------------------------------------------------------

  /**
   * Create an account
   *
   * The created account will be added to 'accounts'
   */
  function createAccount(string memory name) public {
    accounts[msg.sender] = Account({
      owner : msg.sender,
      name : name,
      // TODO: recheck block.timestamp used for date here
      dateCreated : block.timestamp,
      listingIds: new uint[](0), // gives an array of 0 zeros
      totalScore: 0,
      nRatings: 0
    });
    emit CreateAccountEvent(msg.sender);
  }

  function hasAccount() public view returns (bool) {
    return accounts[msg.sender].owner == msg.sender;
  }

  function getAccountName(address owner) public view returns (string memory) {
    require(accounts[owner].owner == owner, 'No such account found');
    return accounts[owner].name;
  }

  function getAccountDateCreated(address owner) public view returns (uint) {
    require(accounts[owner].owner == owner, 'No such account found');
    return accounts[msg.sender].dateCreated;
  }

  function getAccountTotalScore(address addr) public view returns (uint) {
    require(accounts[addr].owner == addr, "No such account");
    return accounts[addr].totalScore;
  }

  function getAccountNumberOfRatings(address addr) public view returns (uint) {
    require(accounts[addr].owner == addr, "No such account");
    return accounts[addr].nRatings;
  }

  // TODO: when implementing:
  // prevent account deletion when there are listings associated or something
  //
  // function deleteAccount() public {
  //
  // }

  // LISTING
  // -----------------------------------------------------------------------

  /** Returns a list of all listings */
  function getAllListings() public view returns (uint[] memory) {
    return listingIds;
  }

  /** Returns a list of all of the message sender's listings */
  function getMyListingIds() public view returns (uint[] memory) {
    require(accounts[msg.sender].owner == msg.sender, "No account found.");
    return accounts[msg.sender].listingIds;
  }

  /**
   * Creates a new listing for the message sender
   * and returns the Id of the created listing
   */
  function createListing(Country country, string memory location, uint price) public {
    require(hasAccount(), "Must have an account before creating a listing");
    // Note: enforce a maximum number of listings per user?
    uint dbid = dateBooker.register(BOOKING_CAPACITY);
    listings[nextListingId] = Listing({
      id : nextListingId,
      owner: msg.sender,
      country: country,
      location: location,
      price: price,
      dbid: dbid
    });
    accounts[msg.sender].listingIds.push(nextListingId);
    listingIds.push(nextListingId);
    emit CreateListingEvent(msg.sender, nextListingId++);
  }

  /**
   * Book a listing
   *
   * @param lid          id of the listing to be booked
   * @param from_date    start date of the booking
   * @param nb_days      number of days for which the booking will be made
   */
  function listingBook(uint lid, uint from_date, uint nb_days) public {
    require(listings[lid].id != 0, "No such listing found.");
    require(hasAccount(), "Must have an account before creating a listing");
    address guestAddr = msg.sender;
    uint dbid = listings[lid].dbid;
    int res = dateBooker.book(dbid, guestAddr, from_date, nb_days);
    // Emit the appropriate event depending on res
    emitBookEvent(res, lid);
    if (res >= 0) {
      uint bid = uint(res);
      // Save the booking
      listings[lid].bookings[bid] = Booking({
        bid: bid,
        lid: lid,
        hostAddr: listings[lid].owner,
        guestAddr: guestAddr,
        hostRating: 0,
        guestRating: 0
      });
    }
  }

  // Rate the booking 1-5 stars
  //
  // The function checks the msg.sender and validates
  // they were either host or guest in the booking.
  // If they were not, a PermissionDenied event is emitted.
  //
  // @param bid     the identifier for their booking, this
  //                coupled with msg.sender is enough to determine
  //                the person being rated
  // @param stars   unsigned integer between 1 and 5, anything else
  //                will emit an error
  // TODO: Only allow users to rate after a certain number of days after booking end date?
  function rate(uint lid, uint bid, uint stars) public {
    require(listings[lid].id == lid && listings[lid].bookings[bid].bid == bid, 'No such listing or booking');
    require(stars >= 1 && stars <= 5, 'Stars arg must be in [1,5]');
    Booking memory booking = listings[lid].bookings[bid];
    require(booking.guestAddr == msg.sender || booking.hostAddr == msg.sender, 'Sender not participated in booking');
    if (booking.guestAddr == msg.sender) {
      // The guest is rating the host
      require(booking.hostRating == 0, 'Host already rated, cannot re-rate.');
      // Assign the rating and adjust their account
      booking.hostRating = stars;
      accounts[booking.hostAddr].totalScore += stars;
      accounts[booking.hostAddr].nRatings++;
    }
    else if (booking.hostAddr == msg.sender) {
      // The host is rating the guest
      require(booking.guestRating == 0, 'Guest already rated, cannot re-rate.');
      // Assing the rating and adjust their account
      booking.guestRating = stars;
      accounts[booking.guestAddr].totalScore += stars;
      accounts[booking.guestAddr].nRatings++;
    }
    emit RatingComplete(msg.sender, bid, stars);
  }

  /**
   * Cancel a booking
   *
   * @param lid           id of the listing to be cancelled
   * @param bid           id of the booking to be cancelled
   */
  function listingCancel(uint lid, uint bid) public {
    checkListingId(lid);
    uint dbid = listings[lid].dbid;
    int res = dateBooker.cancel(dbid, msg.sender, bid);
    emitBookCancelEvent(res, lid, bid);
  }

  function getListingCountry(uint lid) public view returns (Country) {
    checkListingId(lid);
    return listings[lid].country;
  }

  function getListingPrice(uint lid) public view returns (uint) {
    checkListingId(lid);
    return listings[lid].price;
  }

  function setListingPrice(uint lid, uint price) public {
    checkListingId(lid);
    require(price > 0, "Price must be > 0.");
    listings[lid].price = price;
    emit UpdateListingEvent(msg.sender, lid);
  }

  function getListingLocation(uint lid) public view returns (string memory) {
    checkListingId(lid);
    return listings[lid].location;
  }

  function setListingLocation(uint lid, string memory location) public {
    checkListingId(lid);
    listings[lid].location = location;
    emit UpdateListingEvent(msg.sender, lid);
  }

  function getBookingDates(uint lid, uint bid) public view returns (uint from_date, uint to_date) {
    require(listings[lid].id == lid, 'Listing does not exist');
    uint dbid = listings[lid].dbid;
    return dateBooker.get_dates(dbid, bid);
  }

  function deleteListing(uint lid) public {
    checkListingId(lid);
    // TODO: check that there are no pending bookings, before deleting
    delete listings[lid];
    emit DeleteListingEvent(msg.sender, lid);
  }


  function checkListingId(uint lid) view private {
    // Make sure account exists
    require(accounts[msg.sender].owner == msg.sender);
    // Make sure listing exists and properly associated with account
    require(listings[lid].id != 0, "No such listing found.");
    require(listings[lid].owner == msg.sender, "Only the owner of a listing make changes to it.");
  }

  /** Emits an a booking event depending on the result given */
  function emitBookEvent(int result, uint lid) private {
    if (result == dateBooker.BOOK_CONFLICT()) {
      emit BookingConflict(msg.sender, lid);
    } else if (result == dateBooker.NO_MORE_SPACE()) {
      emit BookingNoMoreSpace(msg.sender, lid);
    } else if (result >= 0) {
      emit BookingComplete(msg.sender, lid, uint(result) /* = bid */ );
    }
  }

  /** Emits an a booking cancel event depending on the result given */
  function emitBookCancelEvent(int result, uint lid, uint bid) private {
    if (result == dateBooker.NOT_FOUND()) {
      emit BookingNotFound(msg.sender, lid, bid);
    } else if (result >= 0) {
      emit BookingCancelled(msg.sender, lid, bid);
    }
  }
}