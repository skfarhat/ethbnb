(function() {
  'use strict';
  var EthBnB = artifacts.require("EthBnB");

  contract('EthBnB', function(accounts) {
    it('should create a listing correctly', function() {
      var bnb;

      return EthBnB.deployed()
      /*
       * returns the id and fields of the listing that needs to be created.
       * {
       * 'id': returned_id, 
       * 'price': _price,
       * 'description': _description
       * }
       */
        .then(function(instance) {
          // Create Listing
          // -------------
          console.log(instance);
          bnb = instance;

          // create a listing
          var _location = "London";
          var _price = 5000;
          var _shortName = "Sami's awesome place";
          var _description = "You must be really awesome and Sami-approved to get the room there.\n" + 
            "Also, you must invite him to all of the parties.";
          var id = bnb.createListing(_location, _price, _shortName, _description, {from : accounts[0]});
          return {
            'id' : id, 
            'description' : _description, 
            'location' : _location,
            'price' :  _price, 
            'shortName' : shortName,
          };
        })
        .then(function(listingData) {
          // Check its presence
          // ------------------
          var id = listingData.id;
          assert(id > 0, "The returned Id was zero or negative.");

        });
    });
  });

})();
