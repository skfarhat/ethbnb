var DateBooker = artifacts.require("./DateBooker.sol");
var EthBnB = artifacts.require("./EthBnB.sol");

module.exports = function(deployer) {
  deployer.deploy(EthBnB, DateBooker.address);
};
