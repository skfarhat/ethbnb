// TODO: complete test implementation of delete
//
(function() {
  'use strict'

  const COUNTRIES = {"AF" : 0,"AL" : 1,"DZ" : 2,"AS" : 3,"AD" : 4,"AO" : 5,"AI" : 6,"AQ" : 7,"AG" : 8,"AR" : 9,"AM" : 10,"AW" : 11,"AU" : 12,"AT" : 13,"AZ" : 14,"BS" : 15,"BH" : 16,"BD" : 17,"BB" : 18,"BY" : 19,"BE" : 20,"BZ" : 21,"BJ" : 22,"BM" : 23,"BT" : 24,"BO" : 25,"BA" : 26,"BW" : 27,"BV" : 28,"BR" : 29,"IO" : 30,"BN" : 31,"BG" : 32,"BF" : 33,"BI" : 34,"KH" : 35,"CM" : 36,"CA" : 37,"CV" : 38,"KY" : 39,"CF" : 40,"TD" : 41,"CL" : 42,"CN" : 43,"CX" : 44,"CC" : 45,"CO" : 46,"KM" : 47,"CG" : 48,"CD" : 49,"CK" : 50,"CR" : 51,"CI" : 52,"HR" : 53,"CU" : 54,"CY" : 55,"CZ" : 56,"DK" : 57,"DJ" : 58,"DM" : 59,"DO" : 60,"TP" : 61,"EC" : 62,"EG" : 63,"SV" : 64,"GQ" : 65,"ER" : 66,"EE" : 67,"ET" : 68,"FK" : 69,"FO" : 70,"FJ" : 71,"FI" : 72,"FR" : 73,"GF" : 74,"PF" : 75,"TF" : 76,"GA" : 77,"GM" : 78,"GE" : 79,"DE" : 80,"GH" : 81,"GI" : 82,"GR" : 83,"GL" : 84,"GD" : 85,"GP" : 86,"GU" : 87,"GT" : 88,"GN" : 89,"GW" : 90,"GY" : 91,"HT" : 92,"HM" : 93,"VA" : 94,"HN" : 95,"HK" : 96,"HU" : 97,"IS" : 98,"IN" : 99,"ID" : 100,"IR" : 101,"IQ" : 102,"IE" : 103,"IL" : 104,"IT" : 105,"JM" : 106,"JP" : 107,"JO" : 108,"KZ" : 109,"KE" : 110,"KI" : 111,"KP" : 112,"KR" : 113,"KV" : 114,"KW" : 115,"KG" : 116,"LA" : 117,"LV" : 118,"LB" : 119,"LS" : 120,"LR" : 121,"LY" : 122,"LI" : 123,"LT" : 124,"LU" : 125,"MO" : 126,"MK" : 127,"MG" : 128,"MW" : 129,"MY" : 130,"MV" : 131,"ML" : 132,"MT" : 133,"MH" : 134,"MQ" : 135,"MR" : 136,"MU" : 137,"YT" : 138,"MX" : 139,"FM" : 140,"MD" : 141,"MC" : 142,"MN" : 143,"MS" : 144,"ME" : 145,"MA" : 146,"MZ" : 147,"MM" : 148,"NA" : 149,"NR" : 150,"NP" : 151,"NL" : 152,"AN" : 153,"NC" : 154,"NZ" : 155,"NI" : 156,"NE" : 157,"NG" : 158,"NU" : 159,"NF" : 160,"MP" : 161,"NO" : 162,"OM" : 163,"PK" : 164,"PW" : 165,"PS" : 166,"PA" : 167,"PG" : 168,"PY" : 169,"PE" : 170,"PH" : 171,"PN" : 172,"PL" : 173,"PT" : 174,"PR" : 175,"QA" : 176,"RE" : 177,"RO" : 178,"RU" : 179,"RW" : 180,"SH" : 181,"KN" : 182,"LC" : 183,"PM" : 184,"VC" : 185,"WS" : 186,"SM" : 187,"ST" : 188,"SA" : 189,"SN" : 190,"RS" : 191,"SC" : 192,"SL" : 193,"SG" : 194,"SK" : 195,"SI" : 196,"SB" : 197,"SO" : 198,"ZA" : 199,"GS" : 200,"ES" : 201,"LK" : 202,"SD" : 203,"SR" : 204,"SJ" : 205,"SZ" : 206,"SE" : 207,"CH" : 208,"SY" : 209,"TW" : 210,"TJ" : 211,"TZ" : 212,"TH" : 213,"TG" : 214,"TK" : 215,"TO" : 216,"TT" : 217,"TN" : 218,"TR" : 219,"TM" : 220,"TC" : 221,"TV" : 222,"UG" : 223,"UA" : 224,"AE" : 225,"GB" : 226,"US" : 227,"UM" : 228,"UY" : 229,"UZ" : 230,"VU" : 231,"VE" : 232,"VN" : 233,"VG" : 234,"VI" : 235,"WF" : 236,"EH" : 237,"YE" : 238,"ZM" : 239,"ZW" : 240, }

  const bigNumberToInt = (bn) => {
    return parseInt(bn.toString())
  }

  /** Convenience function
   *
   * Returns seconds timestamp of date in Feb 2019
   * e.g.
   * feb2019(10) returns the timestamp of 10/02/2019 which is 1549756800
   * day_nb = [1..28]
   */
  const feb2019 = (day_nb) => {
    const FEB_01 = 1548979200
    if (day_nb < 1 || day_nb > 28) {
      return -1
    }
    return FEB_01 + (day_nb - 1) * 86400
  }

  const truffleAssert = require('truffle-assertions')
  var EthBnB = artifacts.require("EthBnB")

  contract('EthBnB', async (accounts) => {
    const d = { from : accounts[0] }

    /** Eth account that has no corresponding 'Account' in EthBnB contract **/
    let UNUSED_ACCOUNT = accounts[8]

    /**
     * Checks that hasAccount() returns false when no account has been created
     */
    it('Account: hasAcccount() returns false when no account has been created', async()  => {
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
      let res
      const bnb = await EthBnB.deployed()
      // Create the account
      const _shortName = "sami"
      res = await bnb.createAccount(_shortName, {from: accounts[0]})
      // Check the account exists
      const accountExists = await bnb.hasAccount({from: accounts[0]})
      assert.isTrue(accountExists, "createAccount doesn't seem to have created an account")
      // Check the name is the same
      const actualName = await bnb.getAccountName({from: accounts[0]})
      assert.equal(actualName, _shortName, "The account shortName does not match what we expect.")
    })

    /** Create listing without an account */
    it('Listing: createListing() fails when user has no \'Account\'', async() => {
      const bnb = await EthBnB.deployed()
      // Create a listing
      const _location = 'London'
      const _country = COUNTRIES['GB']
      const _price = 5000
      try {
        var res = await bnb.createListing(_country, _location, _price, {from : UNUSED_ACCOUNT})
        assert(false, "Should have thrown an exception")
      } catch(error) {
        // Test pass
      }
    })

    /**
     *  Check that we can create a listing returning a positive listing Id
     */
    it('Listing: createListing() correct', async() => {
      let res
      let lid
      const bnb = await EthBnB.deployed()
      // Create account
      const _shortName = "Sami"
      res = await bnb.createAccount(_shortName, d)
      // Create a listing
      const _location = 'London'
      const _price = 5000
      const _country = COUNTRIES['GB']
      res = await bnb.createListing(_country, _location, _price, d)
      // Check that an event was emitted
      truffleAssert.eventEmitted(res, 'CreateListingEvent', (ev) => {
        lid = ev.lid;
        return bigNumberToInt(ev.lid) > 0
      }, 'CreateListingEvent should be emitted with the id of the created listing')
    })

    it('Listing can be booked', async() => {
      let res
      let lid
      let bid
      const bnb = await EthBnB.deployed()
      // Create account
      const _shortName = "Sami"
      res = await bnb.createAccount(_shortName, d)
      // Create a listing
      const _location = 'London'
      const _price = 5000
      const _country = COUNTRIES['GB']
      res = await bnb.createListing(_country, _location, _price, d)
      // Check that an event was emitted
      truffleAssert.eventEmitted(res, 'CreateListingEvent', (ev) => lid = ev.lid)
      const from_date = feb2019(10)
      const nb_days = 3
      res = await bnb.listingBook(lid, feb2019(10), 3)
      truffleAssert.eventEmitted(res, 'BookingComplete', (ev) => bid = ev.bid)
    })

    it('Two bookings on the same listing have different bids.', async() => {
      let res
      let bid1
      let bid2
      let lid
      const bnb = await EthBnB.deployed()
      const _shortName = "Sami"
      res = await bnb.createAccount(_shortName, d)
      // Create a listing
      const _location = 'London'
      const _price = 5000
      const _country = COUNTRIES['GB']
      res = await bnb.createListing(_country, _location, _price, d)
      // Check that an event was emitted
      truffleAssert.eventEmitted(res, 'CreateListingEvent', (ev) => lid = ev.lid)
      const nb_days = 3
      res = await bnb.listingBook(lid, feb2019(10), 3)
      truffleAssert.eventEmitted(res, 'BookingComplete', (ev) => bid1 = ev.bid)
      res = await bnb.listingBook(lid, feb2019(20), 3)
      truffleAssert.eventEmitted(res, 'BookingComplete', (ev) => bid2 = ev.bid)
      assert.notEqual(bid1, bid2, 'Bookings on the same listing must have different bids.')
    })

    it('Listing can be cancelled', async() => {
      let res
      let lid
      let bid
      const bnb = await EthBnB.deployed()
      // Create account
      const _shortName = "Sami"
      res = await bnb.createAccount(_shortName, d)
      // Create a listing
      const _location = 'London'
      const _price = 5000
      const _country = COUNTRIES['GB']
      res = await bnb.createListing(_country, _location, _price, d)
      // Get the listing id from the event
      truffleAssert.eventEmitted(res, 'CreateListingEvent', (ev) => lid = ev.lid)
      const from_date = feb2019(10)
      const nb_days = 3
      // Book the listing and get the booking id
      res = await bnb.listingBook(lid, feb2019(10), 3, d)
      truffleAssert.eventEmitted(res, 'BookingComplete', (ev) => bid = ev.bid)
      // Cancel the booking
      res = await bnb.listingCancel(lid, bid, d)
      truffleAssert.eventEmitted(res, 'BookingCancelled')
    })

    it('Cannot cancel inexistent booking', async() => {
      let res
      let lid
      let bid
      const bnb = await EthBnB.deployed()
      // Create account
      const _shortName = "Sami"
      res = await bnb.createAccount(_shortName, d)
      // Create a listing
      const _location = 'London'
      const _price = 5000
      const _country = COUNTRIES['GB']
      res = await bnb.createListing(_country, _location, _price, d)
      // Get the listing id from the event
      truffleAssert.eventEmitted(res, 'CreateListingEvent', (ev) => lid = ev.lid)
      // Cancel inexistent booking booking
      res = await bnb.listingCancel(lid, /* inexistent id */ 128348, d)
      truffleAssert.eventEmitted(res, 'BookingNotFound')
    })

    it('Cannot book more than capacity', async() => {
      let res
      let lid
      let bid
      const bnb = await EthBnB.deployed()
      // Create account
      const _shortName = "Sami"
      let cap = bigNumberToInt(await bnb.BOOKING_CAPACITY.call(d))
      res = await bnb.createAccount(_shortName, d)
      // Create a listing
      const _location = 'London'
      const _price = 5000
      const _country = COUNTRIES['GB']
      res = await bnb.createListing(_country, _location, _price, d)
      // Get the listing id from the event
      truffleAssert.eventEmitted(res, 'CreateListingEvent', (ev) => lid = ev.lid)
      for (let i = 0; i < 5; i++) {
        res = await bnb.listingBook(lid, feb2019(18) + i * 86400, 1, d)
        truffleAssert.eventNotEmitted(res, 'BookingNoMoreSpace')
      }
      res = await bnb.listingBook(lid, /* irrelevant arg */ 23423, 1)
      truffleAssert.eventEmitted(res, 'BookingNoMoreSpace')
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


    // /**
    //  * Test delete
    //  */
    // it("Listing: delete", async() => {
    //   var bnb = await EthBnB.deployed()

    //   // Create a listing
    //   var _location = "Paris"
    //   var _price = 300
    //   var _shortName = "Place to be deleted"
    //   var _description = "Description of a place to be deleted"
    //   try {

    //     // Count the number of listings for account0
    //     var myListings = await bnb.getMyListingIds({from: accounts[0]})
    //     var prevCount = myListings.length

    //     // Create a new listing then delete it
    //     var res = await bnb.createListing(_location, _price, _shortName, _description,
    //       {from : accounts[0]})

    //     // Define delete callback
    //     async function deleteListingCallback(id) {
    //       var res = await bnb.deleteListing(id, {from: accounts[0]})

    //       // Check that a DeleteEvent is emitted
    //       // truffleAssert.eventEmitted(res, "DeleteEvent", (ev) => {
    //         // return ev.id == id
    //       // }, "CreateEvent should be emitted with the id of the created listing")

    //       // TODO: Change most/all function calls to use "call"
    //       // TODO: revert createListing to just emit an event, no need to return.

    //       // Count the number of listings - should be the same as old
    //       var myListings2 = await bnb.getMyListingIds({from: accounts[0]})
    //       var newCount = myListings2.length
    //       assert.equal(newCount, oldCount, "Number of listings changed between creating/deleting")

    //       // Make sure created listing does not appear in myListings
    //       for (var i = 0 ; i < newCount; i++) {
    //         if(myListings2[i] == id)
    //           assert(false)
    //       }
    //     }

    //     truffleAssert.eventEmitted(res, 'CreateEvent', (ev) => {
    //       deleteListingCallback(ev.id)
    //       return ev.id > 0
    //     }, "CreateEvent should be emitted with the id of the created listing")

    //   }
    //   catch(error) {
    //     console.log(error)
    //     assert(false)
    //   }
    // })

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
