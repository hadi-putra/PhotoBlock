const marketplace = artifacts.require('./ImageMarketPlace.sol')

contract("ImageMarketplace", accounts => {
    let contractInstance;

    beforeEach('setup contract for each test', async() => {
        contractInstance = await marketplace.deployed();
    });

    it('initialize the contract', async() => {
        const name = await contractInstance.name.call();
        assert.equal(name, 'PhotoStock', 'has the correct name');
        const imgCount = await contractInstance.imageCount.call();
        assert.equal(imgCount, 0, 'has correct counter')
    });

    it('creating image', async() => {
        const name = 'dummy';
        const ipfs = "QmYb8mNebCaa11cqakJdJMn5fEdFSxU9akSh84SrwmetGW"
        const price = 2;
        const fileExt = ".png";
        const mime = "image/png";

        try {
            await contractInstance.createImage.call('', price, ipfs, fileExt, mime, {from: accounts[0]});
            assert.fail('');
        }catch(err){
            assert.include(err.message, 'revert', 'error message must contain revert');
        }

        try {
            await contractInstance.createImage.call(name, 0, ipfs, fileExt, mime, {from: accounts[0]});
            assert.fail('');
        }catch(err){
            assert.include(err.message, 'revert', 'error message must contain revert');
        }

        try {
            await contractInstance.createImage.call(name, price, '', fileExt, mime, {from: accounts[0]});
            assert.fail('');
        }catch(err){
            assert.include(err.message, 'revert', 'error message must contain revert');
        }

        const{ logs, receipt } = await contractInstance.createImage(name, price, ipfs, fileExt, mime, {from: accounts[0]});
        assert.equal(receipt.status, true);
        assert.equal(logs.length, 1, 'trigger one event');
        assert.equal(logs[0].event, 'ImageCreated', 'should be the "ImageCreated" event');
        assert.equal(logs[0].args.id, 1, 'log index');
        assert.equal(logs[0].args.name, name, 'log name');
        assert.equal(logs[0].args.ipfsHash, ipfs, 'log ipfs');
        assert.equal(logs[0].args.ext, fileExt, 'log file extension');
        assert.equal(logs[0].args.mime, mime, 'log file mime');
        assert.equal(logs[0].args.price, price, 'log price');
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
        assert.equal(image.owner, accounts[0], 'log owner');

        const idUploaded = await contractInstance.imagesUploaded({from: accounts[0]});
        assert.equal(idUploaded[0], 1, "id registered in 'uploaded'");

        try {
            await contractInstance.createImage.call(name, price, ipfs, fileExt, mime, {from: accounts[0]});
            assert.fail('');
        }catch(err){
            assert.include(err.message, 'revert', 'error message must contain revert');
        }
    });

    it('buying an image', async() => {
        const name = 'dummy';
        const ipfs = "QmYb8mNebCaa11cqakJdJMn5fEdFSxU9akSh84SrwmetGW"
        const price = 2;

        try {
            await contractInstance.purchaseImage(0, {from: accounts[0], value: price});
            assert.fail('');
        }catch(err){
            assert.include(err.message, 'revert', 'error message must contain revert');
        }

        try {
            await contractInstance.purchaseImage(1, {from: accounts[0], value: price});
            assert.fail('');
        }catch(err){
            assert.include(err.message, 'revert', 'error message must contain revert');
        }

        try {
            await contractInstance.purchaseImage(1, {from: accounts[1], value: 1});
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
});