var PhotoBlockToken = artifacts.require("./PhotoBlockToken.sol");
var ImageMarketPlace = artifacts.require("./ImageMarketPlace.sol");

module.exports = function(deployer, network, accounts) {
  var instance;
  deployer.deploy(PhotoBlockToken, 1000000000)
    .then(() => PhotoBlockToken.deployed())
    .then((_instance) => {
      instance = _instance;
      var tokenPrice = 1000000000000000;
      return deployer.deploy(ImageMarketPlace, PhotoBlockToken.address, tokenPrice);
    }).then(() => ImageMarketPlace.deployed())
    .then(() => instance.transfer(ImageMarketPlace.address, 800000, { from: accounts[0] }));
};
