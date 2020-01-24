var OptimBookerLib = artifacts.require("./OptimBookerLib1.sol");

module.exports = function(deployer) {
  deployer.deploy(OptimBookerLib);
};
