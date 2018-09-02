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

  event Log(string _functionName, string _message);
  event CreateEvent(string _functionName, uint id, string more); 

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
  function createAccount(string _name) public {
    accounts[msg.sender] = Account({
      owner : msg.sender,
      name : _name,
      // TODO: recheck block.timestamp used for date here
      dateCreated : block.timestamp, 
      listingIds: new uint[](0) // gives an array of 0 zeros
    });
    emit CreateEvent("createAccount", 0, _name); 
  }

  function hasAccount() public view returns (bool) {
    if (accounts[msg.sender].owner == msg.sender) {
      emit Log("hasAccount", "they are equal");
    }
    else {
      emit Log("hasAccount", "they are not equal");
    }
    return accounts[msg.sender].owner == msg.sender;
  }

  function getName() public view returns (string) {
      require(accounts[msg.sender].owner == msg.sender, "No account found.");
      return accounts[msg.sender].name;
  }

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
  function createListing(string _location, uint _price, string _shortName, string _description) public {
    require(hasAccount(), "Must have an account before creating a listing");
    // Note: enforce a maximum number of listings per user?

    listings[nextListingId] = Listing({
      id : nextListingId,
      owner: msg.sender,
      location: _location,
      price: _price,
      shortName: _shortName,
      description: _description
    });

    accounts[msg.sender].listingIds.push(nextListingId); 
    
    emit CreateEvent("createListing", nextListingId, "");

    nextListingId++;
  }

  /**
   * Make the listing with id provided unavailable for the given dates
   * only the listing owner can execute this function
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
  }

  function getListingPrice(uint listingId) public view returns (uint) {
      checkListingId(listingId);
      return /*accounts[msg.sender].*/listings[listingId].price; 
  }

  function setListingPrice(uint listingId, uint _price) public {
    checkListingId(listingId);
    require(_price > 0, "Price must be > 0.");
    listings[listingId].price = _price;
  }

  function setListingShortName(uint listingId, string _shortName) public {
    checkListingId(listingId);
    listings[listingId].shortName = _shortName;
  }

  function setListingDescription(uint listingId, string _description) public {
    checkListingId(listingId);
    listings[listingId].description = _description;
  }

  function deleteListing(uint listingId) public {
    checkListingId(listingId);
    // TODO: check that there are no pending bookings, before deteleting
    delete listings[listingId];
  }

  function checkListingId(uint listingId) view private {
    // make sure account exists
    require(accounts[msg.sender].owner == msg.sender);

    // make sure listing exists and properly associated with account
    require(listings[listingId].id != 0, "No such listing found.");
    require(listings[listingId].owner == msg.sender, "Only the owner of a listing can make it available/unavailable.");
  }

}