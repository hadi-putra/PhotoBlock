var PhotoBlockToken = artifacts.require("./PhotoBlockToken.sol");
var ImageMarketPlace = artifacts.require("./ImageMarketPlace.sol");

module.exports = function(deployer) {
  deployer.deploy(PhotoBlockToken, 1000000000)
    .then(() => PhotoBlockToken.deployed())
    .then(() => {
      var tokenPrice = 1000000000000000;
      return deployer.deploy(ImageMarketPlace, PhotoBlockToken.address, tokenPrice);
    });
};
