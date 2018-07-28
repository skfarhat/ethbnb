(function() {
  'use strict';
  const assert = require("chai").assert;
  // const truffleAssert = require('truffle-assertions');
  var EthBnB = artifacts.require("EthBnB");

  contract('EthBnB', async (accounts) => {

    /**
     * checks that hasAccount() returns false when no account has been created
     */
    it('Account: hasAcccount returns false when no account has been created', async()  => {
      var bnb = await EthBnB.deployed();
      var account0Exists = await bnb.hasAccount.call({from: accounts[0]});
      var account1Exists = await bnb.hasAccount.call({from: accounts[1]});
      assert.isFalse(account0Exists, "Account 0 exists for some reason, shouldn't be the case.");
      assert.isFalse(account1Exists, "Account 1 exists for some reason, shouldn't be the case.");
    });

    /**
     * checks that we can create accounts correctly and that the returned name is correct
     */
    it('Account: createAccount correct', async() => {
      var bnb = await EthBnB.deployed();

      // create the account
      var _shortName = "sami";
      var res = await bnb.createAccount(_shortName, {from: accounts[0]});

      // check the account exists
      var accountExists = await bnb.hasAccount({from: accounts[0]});
      assert.isTrue(accountExists, "createAccount doesn't seem to have created an account");

      // check the name is the same
      var actualName = await bnb.getName.call({from: accounts[0]});
      assert.equal(actualName, _shortName, "The account shortName does not match what we expect.");
    });

    it('Listing: createListing correct', function() {
      var bnb;

      return EthBnB.deployed().then(function(instance) {
        bnb = instance;

        // create account
        var _shortName = "Sami";
        bnb.createAccount.call(_shortName, {from: accounts[0]}).then(function() {
          // create a listing
          var _location = "London";
          var _price = 5000;
          var _shortName = "Sami's awesome place";
          var _description = "You must be really awesome and Sami-approved to get the room there.\n" + 
            "Also, you must invite him to all of the parties.";
          bnb.createListing.call(_location, _price, _shortName, _description, {from : accounts[0]})
            .then(function(listingId) {
              assert(listingId > 0, "The returned Id was zero or negative.");
            });
        });
      })
    });

    /**
     * create listing without an account
     */
    it('Listing: createListing fails when user has no \'Account\'', function() {
      var bnb;
      EthBnB.deployed().then(function(instance) {
        bnb = instance;
        // create a listing
        var _location = "London";
        var _price = 5000;
        var _shortName = "Sami's awesome place";
        var _description = "You must be really awesome and Sami-approved to get the room there.\n" + 
          "Also, you must invite him to all of the parties.";
        bnb.createListing.call(_location, _price, _shortName, _description, {from : accounts[0]})
          .then(function(listingId) {
            assert(listingId < 1, "The returned Id was zero or negative.");
          });
      });
    });

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
      // }); 
  });
})();
