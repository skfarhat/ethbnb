pragma solidity ^0.4.22;

/**
* 
* A calendar day is the minimum duration for a Booking
*/ 
contract EthBnB {
    
    struct Booking { 

        uint id; 

        // TODO: isFinalised (when the bookee confirms their arrival.. etc)
        // cancel booking 
    } 

    struct Listing {

        uint id; 

        uint price; 

        address owner;

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
    

    // =======================================================================
    // FUNCTIONS 
    // =======================================================================


    /**
     * creates a new listing for the message sender
     */
    function createListing(string _location, uint _price, string _description) public {
        // Note: enforce a maximum number of listings per user? 

        require(_price > 0, "Cannot have 0 or negative price"); 

        listings[nextListingId] = Listing({
            id : nextListingId, 
            owner: msg.sender,
            location: _location,
            price: _price, 
            description: _description
        }); 

        nextListingId++; 
     }
   
    /**
     * make the listing with id provided unavailable for the given dates
     * 
     * only the listing owner can execute this function
     */
    function setListingAvailability(uint listingId, uint[] dates, bool available) public {
        Listing storage listing = listings[listingId]; 

        // TODO: move these checks to a new function
        require(listing.id != 0, "No such listing found."); 
        require(listing.owner == msg.sender, "Only the owner of a listing can make it available/unavailable."); 

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
        // TODO: implement
    }

    function setListingDescription(uint listingId, string description) {
        // TODO: implement
    }

    function deleteListing(uint listingId) {
        // TODO: implement 

        // make sure there are no Bookings that are not yet finalised. 
    }

}