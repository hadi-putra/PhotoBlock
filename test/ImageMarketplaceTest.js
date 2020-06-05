const marketplace = artifacts.require('./ImageMarketPlace.sol')
const token = artifacts.require('./PhotoBlockToken.sol')

contract("ImageMarketplace", accounts => {
    let contractInstance;
    var tokenPrice = 1000000000000000;

    beforeEach('setup contract for each test', async() => {
        contractInstance = await marketplace.deployed();
    });

    it('initialize the contract', async() => {
        assert.notEqual(contractInstance.address, 0x0, "has contract address");

        const name = await contractInstance.name.call();
        assert.equal(name, 'PhotoStock', 'has the correct name');

        const imgCount = await contractInstance.imageCount.call();
        assert.equal(imgCount, 0, 'has correct counter')

        const tokenContract = await contractInstance.tokenContract.call();
        assert.notEqual(tokenContract, 0x0, "has token contract address");

        const _tokenPrice = await contractInstance.tokenPrice.call();
        assert.equal(_tokenPrice, tokenPrice, "has token price");
    });

    it('facilitates token buying', async() => {
        const tokenInstance = await token.deployed();
        await tokenInstance.transfer(contractInstance.address, 800000, { from: accounts[0] });

        numberOfTokens = 10;
        const{ logs } = await contractInstance.buyTokens(numberOfTokens, { from: accounts[1], value: numberOfTokens * tokenPrice });

        assert.equal(logs.length, 1, 'triggers one event');
        assert.equal(logs[0].event, 'Sell', 'should be the "Sell" event');
        assert.equal(logs[0].args._buyer, accounts[1], 'logs the account that purchased the tokens');
        assert.equal(logs[0].args._amount, numberOfTokens, 'logs the number of tokens purchased');

        const tokenSold = await contractInstance.tokensSold();
        assert.equal(tokenSold.toNumber(), numberOfTokens, 'increments the number of tokens sold');

        const balance = await tokenInstance.balanceOf(accounts[1]);
        assert.equal(balance.toNumber(), numberOfTokens);

        const balanceMarket = await tokenInstance.balanceOf(contractInstance.address);
        assert.equal(balanceMarket.toNumber(), 800000 - numberOfTokens);
        
        try {
            await contractInstance.buyTokens(numberOfTokens, { from: accounts[1], value: 1});
            assert.fail('');
        } catch (error) {
            assert.include(error.message, 'revert', 'msg.value must equal number of tokens in wei');
        }

        try {
            await contractInstance.buyTokens(900000, { from: accounts[1], value: numberOfTokens * tokenPrice});
            assert.fail('');
        } catch (error) {
            assert.include(error.message, 'revert', 'cannot purchase more tokens than available');
        }
      });

    it('creating image', async() => {
        const name = 'dummy';
        const ipfs = "QmYb8mNebCaa11cqakJdJMn5fEdFSxU9akSh84SrwmetGW"
        const price = 2;
        const fileExt = ".png";
        const mime = "image/png";
        const status = 0;

        try {
            await contractInstance.createImage.call('', price, ipfs, fileExt, mime, status, {from: accounts[0]});
            assert.fail('');
        }catch(err){
            assert.include(err.message, 'revert', 'error message must contain revert');
        }

        try {
            await contractInstance.createImage.call(name, 0, ipfs, fileExt, mime, status, {from: accounts[0]});
            assert.fail('');
        }catch(err){
            assert.include(err.message, 'revert', 'error message must contain revert');
        }

        try {
            await contractInstance.createImage.call(name, price, '', fileExt, mime, status, {from: accounts[0]});
            assert.fail('');
        }catch(err){
            assert.include(err.message, 'revert', 'error message must contain revert');
        }

        const{ logs, receipt } = await contractInstance.createImage(name, price, ipfs, fileExt, mime, status, {from: accounts[0]});
        assert.equal(receipt.status, true);
        assert.equal(logs.length, 1, 'trigger one event');
        assert.equal(logs[0].event, 'ImageCreated', 'should be the "ImageCreated" event');
        assert.equal(logs[0].args.id, 1, 'log index');
        assert.equal(logs[0].args.name, name, 'log name');
        assert.equal(logs[0].args.ipfsHash, ipfs, 'log ipfs');
        assert.equal(logs[0].args.ext, fileExt, 'log file extension');
        assert.equal(logs[0].args.mime, mime, 'log file mime');
        assert.equal(logs[0].args.price, price, 'log price');
        assert.equal(logs[0].args.status, status, "status draft");
        assert.equal(logs[0].args.owner, accounts[0], 'log owner');

        const imgCount = await contractInstance.imageCount.call();
        assert.equal(imgCount, 1, 'has correct counter')

        const image = await contractInstance.images.call(1);
        assert.equal(image.id, 1, 'log index');
        assert.equal(image.name, name, 'log name');
        assert.equal(image.ipfsHash, ipfs, 'log ipfs');
        assert.equal(image.ext, fileExt, 'log file extension');
        assert.equal(image.mime, mime, 'log file mime');
        assert.equal(image.price, price, 'log price');
        assert.equal(image.status, status, 'status draft');
        assert.equal(image.owner, accounts[0], 'log owner');

        const idUploaded = await contractInstance.imagesUploaded({from: accounts[0]});
        assert.equal(idUploaded[0], 1, "id registered in 'uploaded'");

        try {
            await contractInstance.createImage.call(name, price, ipfs, fileExt, mime, status, {from: accounts[0]});
            assert.fail('');
        }catch(err){
            assert.include(err.message, 'revert', 'error message must contain revert');
        }
    });

    it('edit an image', async() => {
        const name = "edit-dummy";
        const price = 2;
        const status = 1;

        try {
            await contractInstance.editImageDescr.call(0, name, price, status, {from: accounts[0]});
            assert.fail('');
        }catch(err){
            assert.include(err.message, 'revert', 'error message must contain revert');
        }

        try {
            await contractInstance.editImageDescr.call(1, '', price, status, {from: accounts[0]});
            assert.fail('');
        }catch(err){
            assert.include(err.message, 'revert', 'error message must contain revert');
        }

        try {
            await contractInstance.editImageDescr.call(1, name, 0, status, {from: accounts[0]});
            assert.fail('');
        }catch(err){
            assert.include(err.message, 'revert', 'error message must contain revert');
        }

        try {
            await contractInstance.editImageDescr.call(1, name, price, 3, {from: accounts[0]});
            assert.fail('');
        }catch(err){
            assert.include(err.message, 'revert', 'error message must contain revert');
        }

        try {
            await contractInstance.editImageDescr.call(1, name, price, status, {from: accounts[1]});
            assert.fail('');
        }catch(err){
            assert.include(err.message, 'revert', 'error message must contain revert');
        }

        const{ logs, receipt } = await contractInstance.editImageDescr(1, name, price, status, {from: accounts[0]});
        assert.equal(receipt.status, true);
        assert.equal(logs.length, 1, 'trigger one event');
        assert.equal(logs[0].event, 'ImageEdited', 'should be the "ImageEdited" event');
        assert.equal(logs[0].args.id, 1, 'log index');
        assert.equal(logs[0].args.name, name, 'log name');
        assert.equal(logs[0].args.price, price, 'log price');
        assert.equal(logs[0].args.status, status, "status draft");

        const imgCount = await contractInstance.imageCount.call();
        assert.equal(imgCount, 1, 'has correct counter')

        const image = await contractInstance.images.call(1);
        assert.equal(image.id, 1, 'log index');
        assert.equal(image.name, name, 'log name');
        assert.equal(image.price, price, 'log price');
        assert.equal(image.status, status, 'status draft');
    });

    it('buying an image', async() => {
        const name = 'edit-dummy';
        const ipfs = "QmYb8mNebCaa11cqakJdJMn5fEdFSxU9akSh84SrwmetGW"
        const price = 2;

        try {
            await contractInstance.purchaseImage.call(0, {from: accounts[0], value: price});
            assert.fail('');
        }catch(err){
            assert.include(err.message, 'revert', 'error message must contain revert');
        }

        try {
            await contractInstance.purchaseImage.call(1, {from: accounts[0], value: price});
            assert.fail('');
        }catch(err){
            assert.include(err.message, 'revert', 'error message must contain revert');
        }

        try {
            await contractInstance.purchaseImage.call(1, {from: accounts[1], value: 1});
            assert.fail('');
        }catch(err){
            assert.include(err.message, 'revert', 'error message must contain revert');
        }

        const{ logs, receipt } = await contractInstance.purchaseImage(1, {from: accounts[1], value: price});
        assert.equal(receipt.status, true);
        assert.equal(logs.length, 1, 'trigger one event');
        assert.equal(logs[0].event, 'ImagePurchased', 'should be the "ImagePurchased" event');
        assert.equal(logs[0].args.id, 1, 'log index');
        assert.equal(logs[0].args.name, name, 'log name');
        assert.equal(logs[0].args.ipfsHash, ipfs, 'log ipfs');
        assert.equal(logs[0].args.price, price, 'log price');
        assert.equal(logs[0].args.owner, accounts[0], 'log owner');

        const isBought = await contractInstance.imagesPaid.call(accounts[1], 1);
        assert.equal(isBought, true, 'buy transaction recorded');

        const idBought = await contractInstance.imagesBought({from: accounts[1]});
        assert.equal(idBought[0], 1, "id registered in 'bought'");
    });

    it('review an image', async() => {
        const rating = 4;
        const content = 'nice image';
        const datePost = parseInt((new Date()).getTime()/1000);

        try {
            await contractInstance.postRate.call(0, content, rating, datePost, {from: accounts[1]});
            assert.fail('');
        }catch(err){
            assert.include(err.message, 'revert', 'error message must contain revert');
        }

        try {
            await contractInstance.postRate.call(1, content, 6, datePost, {from: accounts[1]});
            assert.fail('');
        }catch(err){
            assert.include(err.message, 'revert', 'error message must contain revert');
        }

        try {
            await contractInstance.postRate.call(1, content, rating, 0, {from: accounts[1]});
            assert.fail('');
        }catch(err){
            assert.include(err.message, 'revert', 'error message must contain revert');
        }

        try {
            await contractInstance.postRate.call(1, content, rating, datePost, {from: accounts[0]});
            assert.fail('');
        }catch(err){
            assert.include(err.message, 'revert', 'error message must contain revert');
        }

        const{ logs, receipt } = await contractInstance.postRate(1, content, rating, datePost, {from: accounts[1]});
        assert.equal(receipt.status, true);
        assert.equal(logs.length, 2, 'trigger two events');
        assert.equal(logs[0].event, 'Sell', 'should be the "Sell" event');
        assert.equal(logs[0].args._buyer, accounts[1], 'accounts reviewer');
        assert.equal(logs[0].args._amount, 1, "reward");

        assert.equal(logs[1].event, 'ImageReviewed', 'should be the "ImageReviewed" event');
        assert.equal(logs[1].args.id, 1, 'log index');
        assert.equal(logs[1].args.imageId, 1, "log image id");
        assert.equal(logs[1].args.content, content, 'log content');
        assert.equal(logs[1].args.rating, rating, 'log rating');
        assert.equal(logs[1].args.datePost, datePost, 'log datePost');
        assert.equal(logs[1].args.by, accounts[1], 'log rater');

        const reviewCount = await contractInstance.reviewCount.call();
        assert.equal(reviewCount, 1, 'has correct counter')

        const review = await contractInstance.reviews.call(1);
        assert.equal(review.id, 1, 'log index');
        assert.equal(review.by, accounts[1], 'log reviewer');
        assert.equal(review.content, content, 'log content');
        assert.equal(review.rate, rating, 'log rating');
        assert.equal(review.datePost, datePost, 'log date');

        const reviews = await contractInstance.imagesReviews(1);
        assert.equal(reviews[0], 1, "id registered in 'image reviewed'");
        
    });
});