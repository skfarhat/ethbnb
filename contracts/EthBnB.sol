pragma solidity ^0.4.22;

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

  struct Booking {

    uint id;

    uint dateCreated;

    uint fromDate;

    uint toDate;

    // TODO: isFinalised (when the bookee confirms their arrival.. etc)
    // cancel booking
  }

  struct Listing {

    uint id;

    uint price;

    address owner;

    /** title description of the listing */
    string shortName;

    string description;

    string location;

    /**
     * stores all bookings for this Listing with
     *
     * key       => value
     * bookingId => Booking
     */
    mapping(uint => Booking) bookings;

    /**
     * stores all dates and their corresponding bookings
     *
     * For a booking that spans several days, each date of
     * of the booking duration is stored.
     *
     * key             => value
     * bookingDate     => Booking
     */
    mapping(uint => Booking) bookingDates;

    /**
     * stores all dates where the listing is unavailable.
     *
     * Note that the bool value is of no use here as only,
     * we only care about checking whether a specific date
     * is present in this map.
     */
    mapping(uint => bool) unavailable;

  }

  struct Account {

    address owner;

    /** name of the account owner */
    string name;

    /** date at which the account was created */
    uint dateCreated;

    /**
     * array of all listing ids
     */
    uint[] listingIds;

  }


  // =======================================================================
  // MEMBER VARIABLES
  // =======================================================================

  event Log(string functionName, string msg);

  /* Account Events */ 
  event CreateAccountEvent(address from);
  event UpdateAccountEvent(address from); 
  event DeleteAccountEvent(address from); 

  /* Listing Events */ 
  event CreateListingEvent(address from, uint listingId);
  event UpdateListingEvent(address from, uint listingId); 
  event DeleteListingEvent(address from, uint listingId);

  /**
   *
   */
  uint nextListingId = 1;

  /**
   *
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

  function getMyListingIds() public view returns (uint[]) {
      require(accounts[msg.sender].owner == msg.sender, "No account found.");
      return accounts[msg.sender].listingIds;
  }

  /**
   * Creates a new listing for the message sender
   * and returns the Id of the created listing
   */
  function createListing(string location, uint price, string shortName, string desc) public {
    require(hasAccount(), "Must have an account before creating a listing");
    // Note: enforce a maximum number of listings per user?

    listings[nextListingId] = Listing({
      id : nextListingId,
      owner: msg.sender,
      location: location,
      price: price,
      shortName: shortName,
      description: desc
    });
    accounts[msg.sender].listingIds.push(nextListingId);
    nextListingId++;
    emit CreateListingEvent(msg.sender, nextListingId-1);
  }

  /**
   * Make the listing with id provided unavailable for the given dates
   */
  function setListingAvailability(uint listingId, uint[] dates, bool available) public {
    checkListingId(listingId);

    // if available is 'true', delete the entries from unavailable map
    // else create them
    for(uint i = 0; i < dates.length; i++) {
      uint date = dates[i];
      if (available) {
        delete listings[listingId].unavailable[date];
      }
      else {
        listings[listingId].unavailable[date] = true;
      }
    }
    emit UpdateListingEvent(msg.sender, listingId); 
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

  function getListingShortName(uint listingId) public view returns (string) {
      checkListingId(listingId);
      return listings[listingId].shortName;
  }

  function setListingShortName(uint listingId, string name) public {
    checkListingId(listingId);
    listings[listingId].shortName = name;
    emit UpdateListingEvent(msg.sender, listingId); 
  }

  function getListingDescription(uint listingId) public view returns (string){
      checkListingId(listingId);
      return listings[listingId].description;
  }

  function setListingDescription(uint listingId, string desc) public {
    checkListingId(listingId);
    listings[listingId].description = desc;
    emit UpdateListingEvent(msg.sender, listingId); 
  }

  function deleteListing(uint listingId) public {
    checkListingId(listingId);
    // TODO: check that there are no pending bookings, before deteleting
    delete listings[listingId];
    emit DeleteListingEvent(msg.sender, listingId); 
  }

  function checkListingId(uint listingId) view private {
    // make sure account exists
    require(accounts[msg.sender].owner == msg.sender);

    // make sure listing exists and properly associated with account
    require(listings[listingId].id != 0, "No such listing found.");
    require(listings[listingId].owner == msg.sender, "Only the owner of a listing can make it available/unavailable.");
  }

}