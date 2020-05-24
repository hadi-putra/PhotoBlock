pragma solidity >=0.5.16 <0.7.0;

import "./PhotoBlockToken.sol";

contract ImageMarketPlace is TokenRecipient {
    string public name;
    uint public imageCount = 0;
    mapping(uint => Image) public images;
    mapping(address => mapping(uint => bool)) public imagesPaid;

    PhotoBlockToken private tokenContract;

    constructor(PhotoBlockToken _tokenContract) public {
        name = "PhotoStock";
        tokenContract = _tokenContract;
    }

    struct Image {
        uint id;
        string name;
        string ipfsHash;
        uint price;
        bool purchased;
        address payable owner;
    }

    event ImageCreated(
        uint id,
        string name,
        string ipfsHash,
        uint price,
        bool purchased,
        address payable owner
    );

    event ImageEdited(
        uint id,
        string name,
        uint price
    );

    event ImagePurchased(
        uint id,
        string name,
        string ipfsHash,
        uint price,
        address payable owner
    );

    modifier onlyImageOwner(uint256 _id){
        require(images[_id].owner == msg.sender, "Only copyright holder can edit!");
        _;
    }

    function createImage(string memory _name, uint _price, string memory _ipfsHash) public {
        require(bytes(_ipfsHash).length > 0, "Invalid IPFS address!");
        require(bytes(_name).length > 0, "Name cannot be empty!");
        require(_price > 0, "Price must be not 0!");
        imageCount ++;
        images[imageCount] = Image(imageCount, _name, _ipfsHash, _price, false, msg.sender);
        emit ImageCreated(imageCount, _name, _ipfsHash, _price, false, msg.sender);
    }

    function purchaseImage(uint _id) public payable {
        _purchaseImageFor(_id, msg.sender, msg.value);
    }

    function _purchaseImageFor(uint _id, address _buyer, uint256 _value) private {
        Image memory _img = images[_id];

        address payable _seller = _img.owner;
        require(_img.id > 0 && _img.id <= imageCount, "Invalid image ID!");
        require(_value == _img.price, "The price doesn't match");
        require(_seller != _buyer, "Photographer doesn't need to buy his/her own image");
        require(!imagesPaid[_buyer][_id], "You have already bought this image!");
        imagesPaid[_buyer][_id] = true;
        emit ImagePurchased(_img.id, _img.name, _img.ipfsHash, _img.price, _img.owner);
    }

    function tokenFallback(address _from, uint256 _value, bytes memory _extraData) public returns(bool success){
        uint256 payloadSize;
        uint256 payload;
        assembly {
            payloadSize := mload(_extraData)
            payload := mload(add(_extraData, 0x20))
        }
        payload = payload >> 8*(32 - payloadSize);
        _purchaseImageFor(payload, _from, _value);
        return true;
    }

    function editImageDescr(uint _id, string memory _newName, uint _newPrice) public onlyImageOwner(_id){
        Image memory img = images[_id];
        img.name = _newName;
        img.price = _newPrice;
        images[_id] = img;
        emit ImageEdited(_id, _newName, _newPrice);
    }
}