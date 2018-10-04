// TODO: complete test implementation of delete 
//  
(function() {
  'use strict'

  const assert = require("chai").assert

  const truffleAssert = require('truffle-assertions')
  var EthBnB = artifacts.require("EthBnB")

  contract('EthBnB', async (accounts) => {

    /** Eth account that has no corresponding 'Account' in EthBnB contract **/ 
    let UNUSED_ACCOUNT = accounts[8] 

    /**
     * Checks that hasAccount() returns false when no account has been created
     */
    it('Account: hasAcccount returns false when no account has been created', async()  => {
      var bnb = await EthBnB.deployed()
      var account0Exists = await bnb.hasAccount.call({from: accounts[0]})
      var account1Exists = await bnb.hasAccount.call({from: accounts[1]})
      assert.isFalse(account0Exists, "Account 0 exists for some reason, shouldn't be the case.")
      assert.isFalse(account1Exists, "Account 1 exists for some reason, shouldn't be the case.")
    })

    /**
     * Check that we can create an account
     */
    it('Account: hasAccount() createAccount() are correct', async() => {
      var bnb = await EthBnB.deployed()

      // Create the account
      var _shortName = "sami"
      var res = await bnb.createAccount(_shortName, {from: accounts[0]})

      // Check the account exists
      var accountExists = await bnb.hasAccount({from: accounts[0]})
      assert.isTrue(accountExists, "createAccount doesn't seem to have created an account")

      // Check the name is the same
      var actualName = await bnb.getName.call({from: accounts[0]})
      assert.equal(actualName, _shortName, "The account shortName does not match what we expect.")
    })

    /**
     * Create listing without an account
     */
    it('Listing: createListing fails when user has no \'Account\'', async() => {
      var bnb = await EthBnB.deployed() 

      // Create a listing
      var _location = "London"
      var _price = 5000
      var _shortName = "Sami's awesome place"
      var _description = "The place is so awesome - it's just awesome"
        try {
          var res = await bnb.createListing(_location, _price, _shortName, _description, {from : UNUSED_ACCOUNT})    
          assert(false, "Should have thrown an exception")
        }
        catch(error) {
          // Test pass 
        }
    })

    /**
     *  Check that we can create a listing returning a positive listing Id
     */ 
    it('Listing: createListing correct', async() => {
      var bnb = await EthBnB.deployed() 

      // Create account
      var _shortName = "Sami"
      var res = await bnb.createAccount(_shortName, {from: accounts[0]}) 

      // Create a listing
      var _location = "London"
      var _price = 5000
      var _shortName = "Sami's awesome place"
      var _description = "The place is so awesome - it's just awesome"
      res = await bnb.createListing(_location, _price, _shortName, _description, {from: accounts[0]})
    
      // Check that an event was emitted 
      truffleAssert.eventEmitted(res, 'CreateEvent', (ev) => {
        return ev.id > 0 
      }, 'CreateEvent should be emitted with the id of the created listing')
    })

    /** 
     * Check that getMyListingIds() returns only one entry for account0
     */ 
    it("Listing: getListing()", async() => {
      var bnb = await EthBnB.deployed()

      try {
        var res = await bnb.getMyListingIds({from : accounts[0]})      
        assert(res.length == 1)
        assert(res[0] != 0)
      }
      catch(error) {
        assert(false, "getListing() should not have thrown an exception")
      }
    })

    /** 
     * Test get/set listing price
     */ 
    it("Listing: get/set listing price()", async() => {
      var bnb = await EthBnB.deployed()

      try {
        var res = await bnb.getMyListingIds({from : accounts[0]})      
        var listingId = res[0]

        // Change it to 500 
        var newPrice = 500
        await bnb.setListingPrice(listingId, newPrice, {from : accounts[0]})

        // Check that the changes applied
        var toVerify = await bnb.getListingPrice(listingId, {from : accounts[0]})
        assert.equal(toVerify.toNumber(), newPrice)
      }
      catch(error) {
        console.log(error)
        assert(false, "getListing() should not have thrown an exception")
      }
    })

    /** 
     * Test get/set description and shortName
     */ 
    it("Listing: get/set description and shortName", async() => {
      var bnb = await EthBnB.deployed()

      try {
        var res = await bnb.getMyListingIds({from : accounts[0]})      
        var listingId = res[0]

        // Setters
        var newDescription = "Description NEW"
        var newShortName = "ShortName NEW"
        await bnb.setListingDescription(listingId, newDescription, {from: accounts[0]})
        await bnb.setListingShortName(listingId, newShortName, {from: accounts[0]})

        // Getters
        var actualDescription = await bnb.getListingDescription(listingId, {from: accounts[0]})
        var actualShortName = await bnb.getListingShortName(listingId, {from: accounts[0]})

        assert.equal(actualShortName, newShortName, "ShortNames don't match")
        assert.equal(actualDescription, newDescription, "Descriptions don't match")

      }
      catch(error) {
        console.log(error)
        assert(false, "shortname/description getter or setter should not have thrown an exception")
      }
    })

    /** 
     * Test delete
     */ 
    it("Listing: delete", async() => {
      var bnb = await EthBnB.deployed() 

      // Create a listing
      var _location = "Paris"
      var _price = 300
      var _shortName = "Place to be deleted"
      var _description = "Description of a place to be deleted"
      try {

        // Count the number of listings for account0 
        var myListings = await bnb.getMyListingIds({from: accounts[0]})
        var prevCount = myListings.length

        // Create a new listing then delete it 
        var res = await bnb.createListing(_location, _price, _shortName, _description, 
          {from : accounts[0]})

        // Define delete callback 
        async function deleteListingCallback(id) {
          var res = await bnb.deleteListing(id, {from: accounts[0]})

          // Check that a DeleteEvent is emitted
          // truffleAssert.eventEmitted(res, "DeleteEvent", (ev) => {
            // return ev.id == id
          // }, "CreateEvent should be emitted with the id of the created listing")

          // TODO: Change most/all function calls to use "call"
          // TODO: revert createListing to just emit an event, no need to return. 

          // Count the number of listings - should be the same as old  
          var myListings2 = await bnb.getMyListingIds({from: accounts[0]})
          var newCount = myListings2.length
          assert.equal(newCount, oldCount, "Number of listings changed between creating/deleting")
          
          // Make sure created listing does not appear in myListings 
          for (var i = 0 ; i < newCount; i++) {
            if(myListings2[i] == id) 
              assert(false)
          }
        }

        truffleAssert.eventEmitted(res, 'CreateEvent', (ev) => {
          deleteListingCallback(ev.id)
          return ev.id > 0 
        }, "CreateEvent should be emitted with the id of the created listing")

      }
      catch(error) {
        console.log(error)
        assert(false)
      }
    })

      // FOR DEBUG: 
      // Use snippet below to monitor logs 
      // ---------------------------------
      // var logEvent = bnb.Log()
      // logEvent.watch(function(error, result) {
      //   console.log("received the log event")
      //   if (!error)
      //     console.log(result)
      //   else
      //     console.log(error)
      // }) 
  })
})()
