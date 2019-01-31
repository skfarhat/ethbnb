pragma solidity ^0.4.22;

// TODO: change listingId param to lid. Shorter, better.

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
   AF,AL,DZ,AS,AD,AO,AI,AQ,AG,AR,AM,AW,AU,AT,AZ,BS,BH,BD,BB,BY,BE,BZ,BJ,BM,BT,BO,BA,BW,BV,BR,IO,BN,BG,BF,BI,KH,CM,CA,CV,KY,CF,TD,CL,CN,CX,CC,CO,KM,CG,CD,CK,CR,CI,HR,CU,CY,CZ,DK,DJ,DM,DO,TP,EC,EG,SV,GQ,ER,EE,ET,FK,FO,FJ,FI,FR,GF,PF,TF,GA,GM,GE,DE,GH,GI,GR,GL,GD,GP,GU,GT,GN,GW,GY,HT,HM,VA,HN,HK,HU,IS,IN,ID,IR,IQ,IE,IL,IT,JM,JP,JO,KZ,KE,KI,KP,KR,KV,KW,KG,LA,LV,LB,LS,LR,LY,LI,LT,LU,MO,MK,MG,MW,MY,MV,ML,MT,MH,MQ,MR,MU,YT,MX,FM,MD,MC,MN,MS,ME,MA,MZ,MM,NA,NR,NP,NL,AN,NC,NZ,NI,NE,NG,NU,NF,MP,NO,OM,PK,PW,PS,PA,PG,PY,PE,PH,PN,PL,PT,PR,QA,RE,RO,RU,RW,SH,KN,LC,PM,VC,WS,SM,ST,SA,SN,RS,SC,SL,SG,SK,SI,SB,SO,ZA,GS,ES,LK,SD,SR,SJ,SZ,SE,CH,SY,TW,TJ,TZ,TH,TG,TK,TO,TT,TN,TR,TM,TC,TV,UG,UA,AE,GB,US,UM,UY,UZ,VU,VE,VN,VG,VI,WF,EH,YE,ZM,ZW
  }

  /**
  * @title Represents a single image which is owned by someone.
  */
  struct Image {
    /** IPFS hash */
    string ipfsHash;
    /** Image extension (png, jpeg)*/
    string extension;
    /** Image title */
    string title;
    /** Image's upload timestamp */
    uint256 uploadedOn;
  }


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

    address owner;

    uint price;

    string location;
    
    Country country; 

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

    /** array of all listing ids */
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
  event CreateListingEvent(address from, uint lid);
  event UpdateListingEvent(address from, uint lid);
  event DeleteListingEvent(address from, uint lid);

  /** Listings will have incrementing Ids starting from 1 */
  uint nextListingId = 1;

  /** A list of all listing ids */
  uint[] listingIds;


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

    listings[nextListingId] = Listing({
      id : nextListingId,
      owner: msg.sender,
      country: country,
      location: location,
      price: price
      });
    accounts[msg.sender].listingIds.push(nextListingId);
    listingIds.push(nextListingId);
    nextListingId++;
    emit CreateListingEvent(msg.sender, nextListingId-1);
  }

  /** Make the listing with id provided unavailable for the given dates */
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
    require(listings[listingId].owner == msg.sender, "Only the owner of a listing make changes to it.");
  }

}