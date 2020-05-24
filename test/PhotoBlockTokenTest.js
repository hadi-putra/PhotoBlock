const token = artifacts.require('./PhotoBlockToken.sol');
const marketplace = artifacts.require('./ImageMarketPlace.sol');

contract("PhotoBlockToken", accounts => {
    let tokenInstance;

    beforeEach('setup contract for each test', async() => {
        tokenInstance = await token.deployed();
    });

    it("initializes the contract with the correct values", async() => { 
        const name = await tokenInstance.name.call();
        assert.equal(name, 'PhotoblockCoin', 'has the correct name');
        const symbol = await tokenInstance.symbol.call();
        assert.equal(symbol, 'PBCoin', 'has the correct symbol')
    });

    it("allocates the initial supply upon deployment", async() => {
        const totalSupply = await tokenInstance.totalSupply.call();
        assert.equal(totalSupply.toNumber(), 1000000000, 'sets the total supply to 1,000,000,000');
        const adminBalance = await tokenInstance.balanceOf.call(accounts[0]);
        assert.equal(adminBalance.toNumber(), 1000000000, 'it allocates the initial supply to the admin');
    });

    it("transfer token ownership", async() => {
        try{
            await tokenInstance.transfer.call(accounts[1], 10000000000);
        } catch(err){
            assert.include(err.message, 'revert', 'error message must contain revert')
        }
        const tfAmount = 2000;
    
        const { logs, receipt } = await tokenInstance.transfer(accounts[1], tfAmount, { from: accounts[0]});
        assert.equal(receipt.status, true, 'transfer success');
        assert.equal(logs.length, 1, 'triggers one event');
        assert.equal(logs[0].event, 'Transfer', 'shpuld be the "Transfer" event');
        assert.equal(logs[0].args._from, accounts[0], 'logs the account from');
        assert.equal(logs[0].args._to, accounts[1], 'logs the account to');
        assert.equal(logs[0].args._value, tfAmount, 'logs the transfer amount');

        const balance1 = await tokenInstance.balanceOf.call(accounts[1]);
        assert.equal(balance1.toNumber(), tfAmount, 'adds the receiving amount');
        const balance0 = await tokenInstance.balanceOf.call(accounts[0]);
        assert.equal(balance0.toNumber(), 999998000, 'deduct the amount from the sending account');
    });

    it('approve for delegated transfer', async() =>{
        const { logs, receipt } = await tokenInstance.approve(accounts[1], 100, {from: accounts[0]});
        assert.equal(receipt.status, true, 'it returns true');
        assert.equal(logs.length, 1, 'triggers one event');
        assert.equal(logs[0].event, 'Approval', 'shpuld be the "Approval" event');
        assert.equal(logs[0].args._owner, accounts[0], 'logs the account authorized by');
        assert.equal(logs[0].args._spender, accounts[1], 'logs the account authorized to');
        assert.equal(logs[0].args._value, 100, 'logs the transfer amount');

        const allowance = await tokenInstance.allowance.call(accounts[0], accounts[1]);
        assert.equal(allowance.toNumber(), 100, 'stores the allowance for delegated transfer');
    });

    it('handles for delegated transfer', async() =>{
        fromAccount = accounts[2];
        toAccount = accounts[3];
        spenderAccount = accounts[4];
        tfAmount = 100;
        spendingAmount = 50;

        await tokenInstance.transfer(fromAccount, tfAmount, {from: accounts[0]});
        await tokenInstance.approve(spenderAccount, spendingAmount, { from: fromAccount});

        try{
            await tokenInstance.transferFrom(fromAccount, toAccount, 200, {from: spenderAccount});
            assert.fail('')
        } catch(err){
            assert.include(err.message, 'revert', 'cannot transfer amount larger than balance');
        }

        try{
            await tokenInstance.transferFrom(fromAccount, toAccount, tfAmount, {from: spenderAccount});
            assert.fail('')
        } catch(err){
            assert.include(err.message, 'revert', 'cannot transfer amount larger than approved');
        }

        const { logs, receipt } = await tokenInstance.transferFrom(fromAccount, toAccount, spendingAmount, {from: spenderAccount});
        assert.equal(receipt.status, true);
        assert.equal(logs.length, 1, 'triggers one event');
        assert.equal(logs[0].event, 'Transfer', 'shpuld be the "Transfer" event');
        assert.equal(logs[0].args._from, fromAccount, 'logs the account from');
        assert.equal(logs[0].args._to, toAccount, 'logs the account to');
        assert.equal(logs[0].args._value, spendingAmount, 'logs the transfer amount');

        balanceFrom = await tokenInstance.balanceOf.call(fromAccount);
        balanceTo = await tokenInstance.balanceOf.call(toAccount);
        allowance = await tokenInstance.allowance.call(fromAccount, spenderAccount);

        assert.equal(balanceFrom.toNumber(), 50, 'deducts the amount from the spending account');
        assert.equal(balanceTo.toNumber(), 50, 'add the amount from the spending account');
        assert.equal(allowance.toNumber(), 0, 'deducts the amount from the allowance');
    });

    it('handle transfer will callback', async() => {
        marketplaceInstance = await marketplace.deployed();
        assert.equal(marketplaceInstance, tokenInstance);
    });
});