import React, { Component } from "react";
import {Route, Switch} from 'react-router-dom'
import getWeb3 from "./getWeb3";
import Home from './components/Home'
import NewImage from './components/image/NewImage'
import MyAccount from './components/account/MyAccount'
import EditImage from './components/image/EditImage'
import Image from './components/image/Image'
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
      this.setState({ web3, account: accounts[0], loading: false });
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
      loading: true
    };
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
          account={this.state.account}/>}/>
        <Route
          path="/image/edit/:imageId"
          render = {(props) => <EditImage {...props}
          account = {this.state.account}
          web3 = {this.state.web3}/>}/>
        <Route
          path="/image/:imageId"
          render = {(props) => <Image {...props}
          account = {this.state.account}
          web3 = {this.state.web3}/>}/>
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
