var PhotoBlockToken = artifacts.require("./PhotoBlockToken.sol");
var ImageMarketPlace = artifacts.require("./ImageMarketPlace.sol");

module.exports = function(deployer) {
  deployer.deploy(PhotoBlockToken, 1000000000).then(function(){
    return deployer.deploy(ImageMarketPlace, PhotoBlockToken.address);
  });
};
