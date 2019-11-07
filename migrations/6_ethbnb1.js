var Booker1 = artifacts.require("./OptimBookerLib1.sol");
var EthBnB1 = artifacts.require("./EthBnB1.sol");

module.exports = function(deployer) {
  deployer.link(Booker1, EthBnB1);
  deployer.deploy(EthBnB1);
};
