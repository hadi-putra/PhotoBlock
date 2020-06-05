pragma solidity >=0.5.16 <0.7.0;

import "./PhotoBlockToken.sol";
import "./SafeMath.sol";

contract TokenSale {
    using SafeMath for uint256;

    address payable public admin;
    PhotoBlockToken public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokensSold;

    event Sell(address _buyer, uint256 _amount);

    constructor(PhotoBlockToken _tokenContract, uint256 _tokenPrice) public {
        admin = msg.sender;
        tokenContract = _tokenContract;
        tokenPrice = _tokenPrice;
    }

    modifier adminOnly(){
        require(msg.sender == admin, "Only admin can do this operation");
        _;
    }

    function buyTokens(uint256 _numberOfTokens) public payable {
        require(msg.value == (_numberOfTokens.mul(tokenPrice)), "Insufficient Ether");
        require(tokenContract.balanceOf(address(this)) >= _numberOfTokens, "Overflow token requested");
        require(tokenContract.transfer(msg.sender, _numberOfTokens), "Fail to transfer");

        tokensSold += _numberOfTokens;

        emit Sell(msg.sender, _numberOfTokens);
    }

    function endSale() public adminOnly {
        require(tokenContract.transfer(admin, tokenContract.balanceOf(address(this))), "Transfer to admin");

        // UPDATE: Let's not destroy the contract here
        // Just transfer the balance to the admin
        admin.transfer(address(this).balance);
    }
}