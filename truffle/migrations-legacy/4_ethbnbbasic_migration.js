var EthBnB_Basic = artifacts.require("./EthBnB_Basic.sol");

module.exports = function(deployer) {
  deployer.deploy(EthBnB_Basic);
};
