var Booker = artifacts.require("./OptimBookerLib.sol");
var EthBnB = artifacts.require("./EthBnB.sol");

module.exports = function(deployer) {
  deployer.link(Booker, EthBnB);
  deployer.deploy(EthBnB, Booker.address);
};
