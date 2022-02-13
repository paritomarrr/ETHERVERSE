const Etherverse = artifacts.require("Etherverse");

module.exports = function(deployer) {
  deployer.deploy(Etherverse);
};
