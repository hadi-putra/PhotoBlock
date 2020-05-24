import React, { Component } from "react";
import ImageMarketPlace from "./contracts/ImageMarketPlace.json";
import PhotoBlockToken from "./contracts/PhotoBlockToken.json";
import getWeb3 from "./getWeb3";
import ipfs from"./ipfs";
import Navbar from './components/Navbar'
import Main from './components/Main'

import "bootstrap/dist/css/bootstrap.min.css";

class App extends Component {

  componentWillMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const networkData = ImageMarketPlace.networks[networkId];
      const marketplace = new web3.eth.Contract(
        ImageMarketPlace.abi,
        networkData && networkData.address,
      );

      console.log(marketplace._address)
      console.log(networkData.address)

      const tokenData = PhotoBlockToken.networks[networkId];
      const token = new web3.eth.Contract(
        PhotoBlockToken.abi,
        tokenData && tokenData.address,
      );
      const currencyCode = await token.methods.symbol().call();
      const wallet = await token.methods.balanceOf(accounts[0]).call();
      
      const imageCount = await marketplace.methods.imageCount().call();
      for (var i = 1; i <= imageCount; i++){
        const image = await marketplace.methods.images(i).call();
        image.purchased = await marketplace.methods.imagesPaid(accounts[0], i).call();
        
        this.setState({
          images: [...this.state.images, image]
        })
      }

      this.setState({ web3, account: accounts[0], token, marketplace, currencyCode, wallet, imageCount, loading: false });
      console.log("address", this.state.marketplace);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  constructor(props) {
    super(props)
    this.state = { 
      web3: null, 
      account: '', 
      token: null,
      marketplace: null, 
      currencyCode: '',
      imageCount: 0,
      wallet: 0,
      images: [],
      loading: true
    };

    this.captureFile = this.captureFile.bind(this);
    this.handleUpload = this.handleUpload.bind(this);
    this.retrieveImage = this.retrieveImage.bind(this);
    this.purchaseImage = this.purchaseImage.bind(this);
  }

  captureFile(event){
    event.preventDefault()

    const _file = event.target.files[0]
    this.setState(() => ({file: _file}))
  }

  handleUpload(_name, _price){
    this.setState({loading: true})
    const options = {
      progress: (prog) => console.log(`received: ${prog}`)
    }
    const source = ipfs.add(this.state.file, options)
    this.processIPFS(source, _name, _price)
  }

  async processIPFS(source, _name, _price){
    try {
      for await (const file of source) {
        this.state.marketplace.methods.createImage(_name, _price, file.cid.toString())
          .send({from: this.state.account })
          .once('receipt', (receipt) => {
            console.log(receipt.events.ImageCreated.returnValues)
            this.setState({loading: false})
          })
      }
    } catch (err) {
      console.error(err)
    }
  }

  purchaseImage(_id, _price, _seller){
    this.setState({loading: true})
    this.state.token.methods
      .transferAndCall(this.state.marketplace._address, _seller, _price, this.state.web3.utils.toHex(_id))
      .send({ from: this.state.account })
      .once('receipt', (receipt) => {
        console.log(receipt)
        this.setState({loading: false})
      })
  }

  async retrieveImage(_id, _name){
    const image = await this.state.marketplace.methods.images(_id).call();

    const source = ipfs.cat(`/ipfs/${image.ipfsHash}`)
    try{
      for await (const buffer of source) {
        let blob = new Blob([buffer],{type: "image/jpeg"})
        //let imgUrl = window.URL.createObjectURL(blob)
        var a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";
        let url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = `${_name}.jpeg`;
        a.click()
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.log("exception")
      console.error(err)
    }
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex">
              { this.state.loading
                ? <div id="loader" className="text-center"><p className="text-center">Loading...</p></div>
                : <Main
                    images = {this.state.images}
                    account = {this.state.account}
                    handleUpload = {this.handleUpload}
                    captureFile = {this.captureFile}
                    retrieveImage = {this.retrieveImage}
                    purchaseImage = {this.purchaseImage}
                    web3 = {this.state.web3}
                    />
              }
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
