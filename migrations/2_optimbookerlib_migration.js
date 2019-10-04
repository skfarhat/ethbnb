var OptimBookerLib = artifacts.require("./OptimBookerLib.sol");

module.exports = function(deployer) {
  deployer.deploy(OptimBookerLib);
};
