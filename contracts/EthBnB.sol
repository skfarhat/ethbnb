pragma solidity ^0.4.22;

/**
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
     * stores all of this accounts listings with 'listingId' as the key
     * 
     * key       => value
     * listingId => Listing
     */    
    mapping(uint => Listing);
  }


  // =======================================================================
  // MEMBER VARIABLES
  // =======================================================================


  /**
  * increments for every created listing
  */ 
  uint nextListingId = 1; 

  /** 
  * maps 'listingId' to Listing
  */ 
  mapping(uint => Listing) listings; 

  mapping(uint => Account) accounts;

  // =======================================================================
  // FUNCTIONS 
  // =======================================================================

  function createAccount(string _name) public {


  }

  function checkListingId(uint listingId) {
    Listing storage listing = listings[listingId]; 
    require(listing.id != 0, "No such listing found."); 
    require(listing.owner == msg.sender, "Only the owner of a listing can make it available/unavailable.");  
  }

  /**
  * creates a new listing for the message sender
  * and returns the Id of the created listing
  */
  function createListing(string _location, uint _price, string _shortName, string _description) public returns (uint) {
    // Note: enforce a maximum number of listings per user? 

    listings[nextListingId] = Listing({
      id : nextListingId, 
      owner: msg.sender,
      location: _location,
      price: _price, 
      shortName: _shortName,
      description: _description
    }); 

    nextListingId++; 
    return nextListingId - 1;
  }

  /**
  * returns an array of all listings created by the message sender
  */
  function getMyListings() public {

  }

  /**
  * make the listing with id provided unavailable for the given dates
  * 
    * only the listing owner can execute this function
    */
  function setListingAvailability(uint listingId, uint[] dates, bool available) public {
    Listing storage listing = listings[listingId]; 

    checkListingId(listingId); 

    // if available is 'true', delete the entries from unavailable map
    // else create them 
    for(uint i = 0; i < dates.length; i++) {
      uint date = dates[i]; 
      if (available) {
        delete listing.unavailable[date]; 
      }  
      else {
        listing.unavailable[date] = true; 
      }
    }
  }

  function setListingPrice(uint listingId, uint _price) { 
    checkListingId(listingId); 
    require(_price > 0, "Price must be > 0."); 
    listings[listingId].price = _price; 
  }

  function setListingShortName(uint listingId, string _shortName) {
    checkListingId(listingId); 
    listings[listingId].shortName = _shortName; 
  }

  function setListingDescription(uint listingId, string _description) {
    checkListingId(listingId); 
    listings[listingId].description = _description; 
  }

  function deleteListing(uint listingId) {
    checkListingId(listingId); 
    // TODO: check that there are no pending bookings, before deteleting
    delete listings[listingId]; 
  }

}

