var DateBooker = artifacts.require("./DateBooker.sol");
var EthBnB = artifacts.require("./EthBnB.sol");

module.exports = function(deployer) {
  deployer.link(DateBooker, EthBnB);
  deployer.deploy(EthBnB, DateBooker.address);
};
