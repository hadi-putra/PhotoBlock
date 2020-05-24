const IpfsHttpClient = require('ipfs-http-client');
// const ipfs = new IpfsHttpClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });
//onst ipfs = new IpfsHttpClient("https://mainnet.infura.io/v3/6ed74411e82443c280920cb6692655cb");

// local
const ipfs = new IpfsHttpClient({ host: 'localhost', port: 5001, protocol: 'http' });
// const ipfs = new IpfsHttpClient("/ip4/127.0.0.1/tcp/5001")

export default ipfs;