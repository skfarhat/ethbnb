pragma solidity ^0.4.22;

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

    /** Id returned from the DateBooker upon registration */
    uint bookerId;
   }

   struct Account {

    address owner;

    /** name of the account owner */
    string name;

    /** date at which the account was created */
    uint dateCreated;

    /** array of all listing ids */
    uint[] listingIds;

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

  uint public BOOKING_CAPACITY = 5;

  /** Listings will have incrementing Ids starting from 1 */
  uint nextListingId = 1;

  /** A list of all listing ids */
  uint[] listingIds;

  /** Reference to deployed smart-contract DateBooker initialised in constructor */
  DateBooker dateBooker;

  /**
   * Store all created listings
   * note that these are also stored in each Account.
   *
   * key        => value
   * listingId  => Listing
   */
   mapping(uint => Listing) listings;

  /**
   * Stores created accounts
   *
   * key        => value
   * msg.sender => Account
   */
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
   function createAccount(string name) public {
    accounts[msg.sender] = Account({
      owner : msg.sender,
      name : name,
      // TODO: recheck block.timestamp used for date here
      dateCreated : block.timestamp,
      listingIds: new uint[](0) // gives an array of 0 zeros
    });
    emit CreateAccountEvent(msg.sender);
  }

  function hasAccount() public view returns (bool) {
    return accounts[msg.sender].owner == msg.sender;
  }

  function getAccountName() public view returns (string) {
    require(hasAccount(), "No associated account found.");
    return accounts[msg.sender].name;
  }

  function getAccountDateCreated() public view returns (uint) {
    require(hasAccount(), "No associated account found.");
    return accounts[msg.sender].dateCreated;
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
  function getAllListings() public view returns (uint[]) {
    return listingIds;
  }

  /** Returns a list of all of the message sender's listings */
  function getMyListingIds() public view returns (uint[]) {
    require(accounts[msg.sender].owner == msg.sender, "No account found.");
    return accounts[msg.sender].listingIds;
  }

  /**
   * Creates a new listing for the message sender
   * and returns the Id of the created listing
   */
  function createListing(Country country, string location, uint price) public {
    require(hasAccount(), "Must have an account before creating a listing");
    // Note: enforce a maximum number of listings per user?
    uint bookerId = dateBooker.register(BOOKING_CAPACITY);
    listings[nextListingId] = Listing({
      id : nextListingId,
      owner: msg.sender,
      country: country,
      location: location,
      price: price,
      bookerId: bookerId
    });
    accounts[msg.sender].listingIds.push(nextListingId);
    listingIds.push(nextListingId);
    emit CreateListingEvent(msg.sender, nextListingId++);
  }

  /**
   * Book a listing
   *
   * @param listingId    id of the listing to be booked
   * @param from_date    start date of the booking
   * @param nb_days      number of days for which the booking will be made
   */
  function listingBook(uint listingId, uint from_date, uint nb_days) public {
    checkListingId(listingId);
    uint bookerId = listings[listingId].bookerId;
    int res = dateBooker.book(bookerId, from_date, nb_days);
    emitBookEvent(res, listingId);
  }

  /**
   * Cancel a booking.
   *
   * @param listingId     id of the listing to be cancelled
   * @param bid           id of the booking to be cancelled
   */
  function listingCancel(uint listingId, uint bid) public {
    checkListingId(listingId);
    uint bookerId = listings[listingId].bookerId;
    int res = dateBooker.cancel(bookerId, bid);
    emitBookCancelEvent(res, listingId, bid);
  }

  function getListingCountry(uint listingId) public view returns (Country) {
    checkListingId(listingId);
    return listings[listingId].country;
  }

  function getListingPrice(uint listingId) public view returns (uint) {
    checkListingId(listingId);
    return listings[listingId].price;
  }

  function setListingPrice(uint listingId, uint price) public {
    checkListingId(listingId);
    require(price > 0, "Price must be > 0.");
    listings[listingId].price = price;
    emit UpdateListingEvent(msg.sender, listingId);
  }

  function getListingLocation(uint listingId) public view returns (string) {
    checkListingId(listingId);
    return listings[listingId].location;
  }

  function setListingLocation(uint listingId, string location) public {
    checkListingId(listingId);
    listings[listingId].location = location;
    emit UpdateListingEvent(msg.sender, listingId);
  }

  function getBookingDates(uint listingId, uint bid) public view returns (uint from_date, uint to_date) {
    checkListingId(listingId);
    uint bookerId = listings[listingId].bookerId;
    return dateBooker.get_dates(bookerId, bid);
  }

  function deleteListing(uint listingId) public {
    checkListingId(listingId);
    // TODO: check that there are no pending bookings, before deteleting
    delete listings[listingId];
    emit DeleteListingEvent(msg.sender, listingId);
  }

  function checkListingId(uint listingId) view private {
    // Make sure account exists
    require(accounts[msg.sender].owner == msg.sender);
    // Make sure listing exists and properly associated with account
    require(listings[listingId].id != 0, "No such listing found.");
    require(listings[listingId].owner == msg.sender, "Only the owner of a listing make changes to it.");
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