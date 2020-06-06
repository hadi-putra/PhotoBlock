import React, {Component} from 'react'
import {withStyles} from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import IconButton from '@material-ui/core/IconButton'
import DownloadIcon from '@material-ui/icons/CloudDownload'
import AddToCartIcon from '@material-ui/icons/AddShoppingCart'
import {retrieveImage, purchaseImage} from './ImageActionApi'

const styles = theme => ({
    iconButton: {
        width: '28px',
        height: '28px'
    }
})

class ImageAction extends Component {

    constructor(props){
        super(props)
        this.state = {
            web3: props.web3,
            image: props.image,
            marketplace: props.marketplace,
            token: props.token,
            account: props.account
        }
    }
    
    handlePurchase = async(_image) => {
        purchaseImage(_image, this.state.marketplace, this.state.token, this.state.account, this.state.web3)
            .once('receipt', (receipt) => {
                _image.purchased = true
                this.setState({image: _image})
            }).catch(error => {
                console.error(error.message)
            })
    }

    render(){
        const {classes} = this.props
        return (<span>
            { (this.state.image.owner === this.state.account || this.state.image.purchased) ?
                <IconButton color="secondary" dense="dense" onClick={(event) => {
                    event.preventDefault();
                    retrieveImage(null, this.state.image.id, this.state.marketplace)}}>
                    <DownloadIcon className={this.props.cartStyle || classes.iconButton}/>
                </IconButton> :
                <IconButton color="secondary" dense="dense" onClick={(event) => {
                    event.preventDefault();
                    this.handlePurchase(this.state.image)
                }}>
                    <AddToCartIcon className={this.props.cartStyle || classes.iconButton}/>
                </IconButton> 
            }
        </span>)
    }
}

ImageAction.propTypes = {
    classes: PropTypes.object.isRequired,
    marketplace: PropTypes.object.isRequired,
    token: PropTypes.object.isRequired,
    image: PropTypes.object.isRequired,
    account: PropTypes.string.isRequired
}

export default withStyles(styles)(ImageAction)