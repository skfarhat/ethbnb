(function() {
  'use strict';
  var EthBnB = artifacts.require("EthBnB");

  contract('EthBnB', function(accounts) {

    /**
     * checks that hasAccount() returns false when no account has been created
     */
    it('Account: hasAcccount returns false when no account has been created', function() {
      var bnb; 
      return EthBnB.deployed().then(function(instance) {
        bnb = instance
        var accountExists0 = bnb.hasAccount.call({from: accounts[0]}).then(function(account0Exists) {
          assert.isFalse(account0Exists, "Account 0 exists for some reason, shouldn't be the case.");
        });
        var accountExists1 = bnb.hasAccount.call({from: accounts[1]}).then(function(account1Exists) {
          assert.isFalse(account1Exists, "Account 1 exists for some reason, shouldn't be the case.");
        });
      });
    });

    /**
     * checks that we can create accounts correctly and that the returned name is correct
     */
    it('Account: createAccount correct', function() {
      var bnb; 

      return EthBnB.deployed().then(function(instance) {
        bnb = instance;

        var _shortName = "sami";
        bnb.createAccount(_shortName, {from: accounts[0]});
        var accountExists = bnb.hasAccount.call( {from: accounts[0]} );
        assert(accountExists, "createAccount doesn't seem to have created an account");
        bnb.getName.call(function(actualName) {
          assert(actualName === _shortName, "The account shortName does not match what we expect.");
        });
      });
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

  });
})();
