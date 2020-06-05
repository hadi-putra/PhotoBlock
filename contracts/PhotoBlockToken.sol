pragma solidity >=0.5.16 <0.7.0;

import "./SafeMath.sol";

interface TokenRecipient {
    function tokenFallback(address _from, uint256 _value, bytes calldata _extraData) external returns(bool);
}

contract PhotoBlockToken{
    using SafeMath for uint256;

    string public name;
    string public symbol;
    uint256 public totalSupply;
    mapping(address => uint256) public balances;
    mapping(address => mapping(address => uint256)) allowances;

    constructor(uint256 _initialSupply) public{
        totalSupply = _initialSupply;
        balances[msg.sender] = _initialSupply;
        name = "PhotoblockCoin";
        symbol = "PBCoin";
    }

    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 _value
    );

    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );

    function transfer(address _to, uint256 _value) public returns(bool success){
        require(_to != address(0), "Invalid address!");
        require(balances[msg.sender] >= _value, "Insuffucient Balance");

        balances[msg.sender] = balances[msg.sender].sub(_value);
        balances[_to] = balances[_to].add(_value);
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns(bool success){
        require(balances[_from] >= _value, "Insufficient Balance");
        require(allowances[_from][msg.sender] >= _value, "Insufficient Allowance");

        balances[_from] = balances[_from].sub(_value);
        balances[_to] = balances[_to].add(_value);
        allowances[_from][msg.sender] = allowances[_from][msg.sender].sub(_value);
        emit Transfer(_from, _to, _value);
        return true;
    }

    function approve(address _spender, uint256 _value) public returns(bool success){
        allowances[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function transferAndCall(address _contract, address _to, uint256 _value, bytes memory _extraData) public {
        TokenRecipient recipient = TokenRecipient(_contract);
        require(recipient.tokenFallback(msg.sender, _value, _extraData), "Fallback fail");
        transfer(_to, _value);
    }

    function balanceOf(address _owner) public view returns(uint256 balance){
        return balances[_owner];
    }

    function allowance(address _owner, address _spender) public view returns (uint256 remaining){
        return allowances[_owner][_spender];
    }
}