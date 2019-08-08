var DateBooker = artifacts.require("./DateBooker.sol");
var TestDateBooker = artifacts.require("./TestDateBooker.sol");

module.exports = function(deployer) {
  deployer.link(DateBooker, TestDateBooker);
  deployer.deploy(TestDateBooker, DateBooker.address);
};
