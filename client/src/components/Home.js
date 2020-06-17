import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles'
import ImageMarketPlace from "./../contracts/ImageMarketPlace.json";
import PhotoBlockToken from "./../contracts/PhotoBlockToken.json";
import Images from './image/Images'

const styles = theme => ({
    root: {
        flexGrow: 1,
        margin: 30,
    }
});

class Home extends Component {

    componentDidMount = async() => {
        try{
            const web3 = this.props.web3
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
            
            const imageCount = await marketplace.methods.imageCount().call();
            for (var i = 1; i <= imageCount; i++){
                const image = await marketplace.methods.images(i).call();
                if(parseInt(image.status) === 1){
                    image.purchased = await marketplace.methods.imagesPaid(this.state.account, i).call();
                    this.setState({
                        images: [...this.state.images, image]
                    })
                }
            }
            this.setState({marketplace, token, currencyCode})
        } catch(error){
            console.error(error)
        }
        
    }
    
    constructor(props){
        super(props)
        this.state = {
            marketplace: null,
            token: null,
            account: props.account,
            images: [],
            currencyCode: ''
        }
    }

    render(){
        if (!this.state.marketplace)
            return <div>Loading contract...</div>;
        
        const {classes} = this.props
        return (
            <div className={classes.root}>
                <Images
                    web3 = {this.props.web3}
                    account = {this.state.account}
                    images = {this.state.images}
                    currencyCode = {this.state.currencyCode}
                    marketplace = {this.state.marketplace}
                    token = {this.state.token}
                />
            </div>
        );
    }
}

Home.propTypes = {
    classes: PropTypes.object.isRequired
}

export default withStyles(styles)(Home)