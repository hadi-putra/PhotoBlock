import ipfs from'./../../ipfs';
const fileDownload = require('js-file-download');

const retrieveImage = async ( _image, _id = 0, _contract = null) => {
    const image = _image ? _image : await _contract.methods.images(_id).call();

    const source = ipfs.cat(`/ipfs/${image.ipfsHash}`)

    try{
        for await (const buffer of source) {
            fileDownload(buffer, `${image.name}.${image.ext}`, image.mime)
        }
    } catch (err) {
        console.log("exception")
        console.error(err)
    }
}

const purchaseImage = (_image, _contractInstance, _tokenInstance, _account, _web3) => {
    return _tokenInstance.methods.transferAndCall(_contractInstance._address, _image.owner, 
        _image.price, _web3.utils.toHex(_image.id)).send({ from: _account })
}
export {retrieveImage, purchaseImage}