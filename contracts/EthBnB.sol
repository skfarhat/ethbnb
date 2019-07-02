pragma solidity ^0.5.0;

import './DateBooker.sol';

//
//
// Listings:
// ---------
// Created listings are stored in the their account's struct as well as in the
// contract's listings mapping.
//
//
// A calendar day is the minimum duration for a Booking
//
contract EthBnB {

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

    // Every listing has its own DateBooker 'id' which allows
    // the DateBooker contract to setup the appropriate data structure
    // for storing booking information for that Listing.
    //
    // Field is set in createListing
    uint dbid;
    // Bookings for the given listing
    mapping(uint => Booking) bookings;

    uint256 balance;
  }

  struct Account {
    address payable owner;
    string name;
    uint dateCreated;
    // Account's average rating (out of 5) can be computed as
    // totalScore / totalRatings
    uint totalScore;
    uint nRatings;
  }

  struct Booking {
    uint bid;
    uint lid;
    address guestAddr;
    address ownerAddr;
    // Rating assigned to the owner by the guest
    // defaults to 0 which means nothing was set
    uint ownerRating;
    // Rating assigned to the guest by the owner
    // defaults to 0 which means nothing was set
    uint guestRating;

    // When a booking is made, the listing balance (staked by the host)
    // along with the value staked by the guest are added to the balance here.
    // The listing balance is obviously decreased.
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
  event BookingConflict(address from, uint lid);
  event BookingNoMoreSpace(address from, uint lid);
  event BookingCancelled(address from, uint lid, uint bid);
  event BookingNotFound(address from, uint lid, uint bid);

  event RatingComplete(address from, uint lid, uint bid, uint stars);

  uint public BOOKING_CAPACITY = 5;

  // Listings will have incrementing Ids starting from 1
  uint nextListingId = 1;

  // Reference to deployed smart-contract DateBooker initialised in constructor
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

  modifier accountExists(address owner) {
    require(accounts[owner].owner == owner);
    _;
  }

  function createAccount(string memory name) public {
    accounts[msg.sender] = Account({
      owner : msg.sender,
      name : name,
      // TODO: recheck block.timestamp used for date here
      dateCreated : block.timestamp,
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

  // TODO: when implementing:
  // prevent account deletion when there are listings associated or something
  //
  // function deleteAccount() public {
  //
  // }

  // LISTING
  // -----------------------------------------------------------------------

  modifier listingExists(uint lid) {
    require(listings[lid].lid == lid, 'No such listing found');
    _;
  }

  function getListingAll(uint lid) public listingExists(lid) view
    returns (address owner, uint price, string memory location, Country country) {
      Listing memory l = listings[lid];
      return (l.owner, l.price, l.location, l.country);
    }

  // Creates a new listing for the message sender
  // and returns the Id of the created listing
  //
  // When the listing create the smart-contract will have had the 2xprice amount
  // added to its balance.
  function createListing(Country country, string memory location, uint price) public payable {
    require(hasAccount(), 'Must have an account before creating a listing');
    require(msg.value >= 2*price, 'Must stake at least x2 the price');
    // Note: enforce a maximum number of listings per user?
    uint dbid = dateBooker.register(BOOKING_CAPACITY);
    listings[nextListingId] = Listing({
      lid : nextListingId,
      owner: msg.sender,
      country: country,
      location: location,
      price: price,
      dbid: dbid,
      balance: msg.value
    });
    emit CreateListingEvent(msg.sender, nextListingId++);
  }

  // Book a listing
  //
  // @param lid          id of the listing to be booked
  // @param fromDate     start date of the booking
  // @param nbOfDays     number of days for which the booking will be made
  //
  function listingBook(uint lid, uint fromDate, uint nbOfDays)
    public payable listingExists(lid) {
      require(hasAccount(), 'Guest must have an account before booking');
      Listing storage listing = listings[lid];
      uint256 stake = 2 * listing.price;
      address guestAddr = msg.sender;
      uint dbid = listing.dbid;

      require(listing.owner != msg.sender, 'Owner cannot book their own listing');

      // Ensure both guest and host have staked the same
      require(msg.value >= stake, 'Guest must stake twice the price');
      require(listing.balance >= stake, 'Listing must have stake amount in its balance');

      // Refund with any amount exceeding the stake
      msg.sender.transfer(msg.value - stake);

      // Try to book.
      // If successful, create a booking event with the balance amount
      // If unsuccessful, refund the stake to guest
      int res = dateBooker.book(dbid, fromDate, nbOfDays);
      emitBookEvent(res, lid);
      if (res >= 0) {
        uint bid = uint(res);
         // Save the booking
         listing.bookings[bid] = Booking({
          bid: bid,
          lid: lid,
          ownerAddr: listings[lid].owner,
          guestAddr: guestAddr,
          ownerRating: 0,
          guestRating: 0,
          // Add the amounts staked by the guest
          // and by the host to the booking balance
          balance: 2 * stake
        });

        // Decrement the listing balance
        listing.balance -= stake;
      } else {
        msg.sender.transfer(stake);
      }
    }

  // Returns the listing balance to its owner and deletes the listing
  //
  // Only if there are no active bookings.
  function listingDelete(uint lid) public listingExists(lid) {
    Listing storage listing = listings[lid];

    // Check that there are no active bookings before we proceed
    uint activeBookings = dateBooker.getActiveBookingsCount(listing.dbid);
    require(activeBookings == 0, 'Cannot delete listing when there are active bookings');

    // Return listing balance to its owner
    uint toReturn = listing.balance;
    listing.balance = 0;
    accounts[listing.owner].owner.transfer(toReturn);

    // Delete listing's storage
    delete listings[lid];
    emit DeleteListingEvent(msg.sender, lid);
  }

  // Rate the booking 1-5 stars
  //
  // The function checks the msg.sender and validates
  // they were either owner or guest in the booking.
  // If they were not, a PermissionDenied event is emitted.
  //
  // @param bid     the identifier for their booking, this
  //                coupled with msg.sender is enough to determine
  //                the person being rated
  // @param stars   unsigned integer between 1 and 5, anything else
  //                will emit an error
  function rate(uint lid, uint bid, uint stars) public {
    require(listings[lid].lid == lid && listings[lid].bookings[bid].bid == bid, 'No such listing or booking');
    require(stars >= 1 && stars <= 5, 'Stars arg must be in [1,5]');
    Booking storage booking = listings[lid].bookings[bid];
    require(booking.guestAddr == msg.sender || booking.ownerAddr == msg.sender, 'Sender not participated in booking');
    (, uint toDate) = getBookingDates(lid, bid);
    require(toDate <= now, 'Cannot rate a booking before it ends');
    if (booking.guestAddr == msg.sender) {
      // The guest is rating the owner
      require(booking.ownerRating == 0, 'Owner already rated, cannot re-rate');
      // Assign the rating and adjust their account
      booking.ownerRating = stars;
      accounts[booking.ownerAddr].totalScore += stars;
      accounts[booking.ownerAddr].nRatings++;
    }
    else if (booking.ownerAddr == msg.sender) {
      // The owner is rating the guest
      require(booking.guestRating == 0, 'Guest already rated, cannot re-rate');
      // Adding the rating and adjust their account
      booking.guestRating = stars;
      accounts[booking.guestAddr].totalScore += stars;
      accounts[booking.guestAddr].nRatings++;
    }
    // If both have rated one another, we release the funds as below:
    // Guest receives:    booking.balance
    // Listing receives:  2 x booking.balance
    // Owner:             booking.balance
    //
    if (booking.ownerRating != 0 && booking.guestRating != 0) {
        // TODO: BUG: if not divisible by 4, we could lose some money (?!)
      uint256 stake = booking.balance / 4;
      listings[lid].balance += stake * 2;
      accounts[booking.ownerAddr].owner.transfer(stake);
      accounts[booking.guestAddr].owner.transfer(stake);
    }
    emit RatingComplete(msg.sender, lid, bid, stars);
  }

  // Cancel a booking
  //
  // @param lid           id of the listing to be cancelled
  // @param bid           id of the booking to be cancelled
  function listingCancel(uint lid, uint bid) public {
    checkListingId(lid);
    uint dbid = listings[lid].dbid;
    int res = dateBooker.cancel(dbid, bid);
    emitBookCancelEvent(res, lid, bid);
  }

  function setListingPrice(uint lid, uint price) public {
    checkListingId(lid);
    require(price > 0, 'Price must be > 0');
    listings[lid].price = price;
    emit UpdateListingEvent(msg.sender, lid);
  }

  function setListingLocation(uint lid, string memory location) public {
    checkListingId(lid);
    listings[lid].location = location;
    emit UpdateListingEvent(msg.sender, lid);
  }

  function getBookingDates(uint lid, uint bid) public view returns (uint fromDate, uint toDate) {
    require(listings[lid].lid == lid, 'Listing does not exist');
    uint dbid = listings[lid].dbid;
    return dateBooker.getDates(dbid, bid);
  }

  function checkListingId(uint lid) view private {
    // Make sure account exists
    require(accounts[msg.sender].owner == msg.sender);
    // Make sure listing exists and properly associated with account
    require(listings[lid].lid != 0, 'No such listing found');
    require(listings[lid].owner == msg.sender, 'Only the owner of a listing make changes to it');
  }

  // Emits an a booking event depending on the result given
  function emitBookEvent(int result, uint lid) private {
    if (result == dateBooker.BOOK_CONFLICT()) {
      emit BookingConflict(msg.sender, lid);
    } else if (result == dateBooker.NO_MORE_SPACE()) {
      emit BookingNoMoreSpace(msg.sender, lid);
    } else if (result >= 0) {
      emit BookingComplete(msg.sender, lid, uint(result) /* = bid */ );
    }
  }

  // Emits an a booking cancel event depending on the result given
  function emitBookCancelEvent(int result, uint lid, uint bid) private {
    if (result == dateBooker.NOT_FOUND()) {
      emit BookingNotFound(msg.sender, lid, bid);
    } else if (result >= 0) {
      emit BookingCancelled(msg.sender, lid, bid);
    }
  }
}