import React, { Component } from "react";
import {Route, Switch} from 'react-router-dom'
import ImageMarketPlace from "./contracts/ImageMarketPlace.json";
import PhotoBlockToken from "./contracts/PhotoBlockToken.json";
import getWeb3 from "./getWeb3";
import Home from './components/Home'
import NewImage from './components/image/NewImage'
import MyAccount from './components/account/MyAccount'
import Navbar from './components/Navbar'

import "bootstrap/dist/css/bootstrap.min.css";

class App extends Component {

  componentDidMount = async () => {
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
  }

  purchaseImage(_id, _price, _seller, _index){
    this.setState({loading: true})
    this.state.token.methods
      .transferAndCall(this.state.marketplace._address, _seller, _price, this.state.web3.utils.toHex(_id))
      .send({ from: this.state.account })
      .once('receipt', (receipt) => {
        const images = this.state.images
        images[_index].purchased = true
        this.setState({images})
        this.setState({loading: false})
      })
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return(<div>
      <Navbar account={this.state.account} />
      <Switch>
        <Route 
          exact path="/" 
          render = {(props) => <Home {...props} 
            web3={this.state.web3}
            account={this.state.account}/>}/>
        <Route
          path="/image/new"
          render = {(props) => <NewImage {...props}
          web3={this.state.web3}
          marketplace={this.state.marketplace}
          account={this.state.account}/>}/>
        <Route
          path="/my-account"
          render = {(props) => <MyAccount {...props}
          account = {this.state.account}
          web3 = {this.state.web3}
          />}/>
      </Switch>
    </div>);
  }
}

export default App;
