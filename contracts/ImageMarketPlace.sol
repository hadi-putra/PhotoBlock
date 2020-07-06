pragma solidity >=0.5.16 <0.7.0;

import "./PhotoBlockToken.sol";
import "./TokenSale.sol";

contract ImageMarketPlace is TokenRecipient, TokenSale {
    string public name;
    uint public imageCount = 0;
    uint public reviewCount = 0;
    
    mapping(uint => Image) public images;
    mapping(address => uint[]) private imageUploaded;
    mapping(address => uint[]) private imageBought;
    mapping(address => mapping(uint => bool)) public imagesPaid;
    mapping(string => bool) private imageExist;
    mapping(uint => ImageStat) public stats;
    mapping(uint => uint[]) private imageReviews;
    mapping(uint => Review) public reviews;
    mapping(address => mapping(uint => bool)) public haveReviewed;
    mapping(address => mapping(uint => bool)) private hasPaid;

    constructor(PhotoBlockToken _tokenContract, uint256 _tokenPrice) TokenSale(_tokenContract, _tokenPrice) public {
        name = "PhotoStock";
    }

    enum Status {Draft, Publish, Archieve}

    struct Review{
        uint id;
        address payable by;
        string content;
        uint rate;
        uint datePost;
    }

    struct ImageStat{
        uint totalRate;
        uint total;
    }

    struct Image {
        uint id;
        string name;
        string ipfsHash;
        string ext;
        string mime;
        uint price;
        bool purchased;
        Status status;
        address payable owner;
    }

    event ImageCreated(
        uint id,
        string name,
        string ipfsHash,
        string ext,
        string mime,
        uint price,
        bool purchased,
        Status status,
        address payable owner
    );

    event ImageEdited(
        uint id,
        string name,
        uint price,
        Status status
    );

    event ImagePurchased(
        uint id,
        string name,
        string ipfsHash,
        uint price,
        address payable owner
    );

    event ImageReviewed(
        uint id,
        uint imageId,
        string content,
        uint rating,
        uint datePost,
        address payable by
    );

    modifier onlyImageOwner(uint256 _id){
        require(_id > 0 && _id <= imageCount, "Invalid image ID!");
        require(images[_id].owner == msg.sender, "Only copyright holder can edit!");
        _;
    }

    function imagesUploaded() public view returns(uint[] memory){
        return imageUploaded[msg.sender];
    }

    function imagesBought() public view returns(uint[] memory){
        return imageBought[msg.sender];
    }

    function imagesReviews(uint imageId) public view returns(uint[] memory){
        return imageReviews[imageId];
    }

    function createImage(string memory _name, uint _price, string memory _ipfsHash, 
                         string memory _fileExt, string memory _fileMime, uint _status) public {
        require(bytes(_ipfsHash).length > 0, "Invalid IPFS address!");
        require(bytes(_name).length > 0, "Name cannot be empty!");
        require(_price > 0, "Price must be not 0!");
        require(!imageExist[_ipfsHash], "Image already exist!");
        require(uint(Status.Archieve) >= _status, "Invalid status");
        imageCount ++;
        imageExist[_ipfsHash] = true;
        images[imageCount] = Image(imageCount, _name, _ipfsHash, _fileExt, _fileMime, _price, false, Status(_status), msg.sender);
        imageUploaded[msg.sender].push(imageCount);
        emit ImageCreated(imageCount, _name, _ipfsHash, _fileExt, _fileMime, _price, false, Status(_status), msg.sender);
    }

    function purchaseImage(uint _id) public payable {
        _purchaseImageFor(_id, msg.sender, msg.value);
    }

    function _purchaseImageFor(uint _id, address _buyer, uint256 _value) private {
        require(_id > 0 && _id <= imageCount, "Invalid image ID!");
        Image memory _img = images[_id];

        address payable _seller = _img.owner;
        require(_value == _img.price, "The price doesn't match");
        require(_seller != _buyer, "Photographer doesn't need to buy his/her own image");
        require(_img.status == Status.Publish, "Only published image can be bought");
        require(!imagesPaid[_buyer][_id], "You have already bought this image!");
        imagesPaid[_buyer][_id] = true;
        imageBought[_buyer].push(_id);
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

    function editImageDescr(uint _id, string memory _newName, uint _newPrice, uint _newStatus) public onlyImageOwner(_id){
        require(bytes(_newName).length > 0, "Name cannot be empty!");
        require(_newPrice > 0, "Price must be not 0!");
        require(uint(Status.Archieve) >= _newStatus, "Invalid status");
        Image memory img = images[_id];
        img.name = _newName;
        img.price = _newPrice;
        img.status = Status(_newStatus);
        images[_id] = img;
        emit ImageEdited(_id, _newName, _newPrice, img.status);
    }

    function postRate(uint _imageId, string memory _content, uint _rateValue, uint _datePost) public {
        require(_imageId > 0 && _imageId <= imageCount, "Invalid image ID");
        require(msg.sender != address(0), "Invalid address");
        require(_datePost > 0, "Invalid Date");
        require(_rateValue > 0 && _rateValue <= 5, "Invalid rate value");
        require(imagesPaid[msg.sender][_imageId], "Sender hasn't bought the image");
        require(!haveReviewed[msg.sender][_imageId], "Sender can only review once");
        Image memory _img = images[_imageId];
        require(_img.owner != msg.sender, "Owner can't review");
        require(_img.status == Status.Publish, "Only published image can be reviewed");
        reviewCount++;
        Review memory review = Review(reviewCount, msg.sender, _content, _rateValue, _datePost);
        ImageStat memory imgStat = stats[_imageId];

        imgStat.totalRate = imgStat.totalRate + _rateValue;
        imgStat.total = imgStat.total + 1;
        stats[_imageId] = imgStat;
        imageReviews[_imageId].push(reviewCount);
        reviews[reviewCount] = review;
        haveReviewed[msg.sender][_imageId] = true;

        // Send bonus if meet the criteria
        if(!hasPaid[msg.sender][_imageId] && tokenContract.balanceOf(address(this)) >= 1){
            // transfer 1 PBCoin
            sendTokenTo(msg.sender, 10);
            hasPaid[msg.sender][_imageId] = true;
        }

        if (imgStat.total >= 100 && (imgStat.totalRate/imgStat.total) > 4 
            && !hasPaid[_img.owner][_imageId] && tokenContract.balanceOf(address(this)) >= 2){
            // transfer 2 PBCoin
            sendTokenTo(_img.owner, 30);
            hasPaid[_img.owner][_imageId] = true;
        }

        emit ImageReviewed(reviewCount, _imageId, _content, _rateValue, _datePost, msg.sender);
    }

    function sendTokenTo(address _to, uint _value) private {
        require(tokenContract.transfer(_to, _value), "Fail to transfer");
        tokensSold += _value;
        emit Sell(_to, _value);
    }
}