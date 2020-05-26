import React, {Component} from 'react'
import {withStyles} from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import IconButton from '@material-ui/core/IconButton'
import DownloadIcon from '@material-ui/icons/CloudDownload'
import AddToCartIcon from '@material-ui/icons/AddShoppingCart'
import ipfs from'./../../ipfs';

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
    
    retrieveImage = async(_id) => {
        const image = await this.state.marketplace.methods.images(_id).call();

        const source = ipfs.cat(`/ipfs/${image.ipfsHash}`)
        try{
            for await (const buffer of source) {
                let blob = new Blob([buffer],{type: image.mime})
                //let imgUrl = window.URL.createObjectURL(blob)
                var a = document.createElement("a");
                document.body.appendChild(a);
                a.style = "display: none";
                let url = window.URL.createObjectURL(blob);
                a.href = url;
                a.download = `${image.name}.${image.ext}`;
                a.click()
                window.URL.revokeObjectURL(url);
            }
        } catch (err) {
            console.log("exception")
            console.error(err)
        }
    }

    purchaseImage = async(_image) => {
        this.state.token.methods
            .transferAndCall(this.state.marketplace._address, _image.owner, 
                _image.price, this.state.web3.utils.toHex(_image.id))
            .send({ from: this.state.account })
            .once('receipt', (receipt) => {
                _image.purchased = true
                this.setState({image: _image})
            })
    }

    render(){
        const {classes} = this.props
        return (<span>
            { (this.state.image.owner !== this.state.account) ?
                !this.state.image.purchased ?
                    <IconButton color="secondary" dense="dense" onClick={(event) => {
                        event.preventDefault();
                        this.purchaseImage(this.state.image)
                    }}>
                        <AddToCartIcon className={this.props.cartStyle || classes.iconButton}/>
                    </IconButton> :
                    <IconButton color="secondary" dense="dense" onClick={(event) => {
                        event.preventDefault();
                        this.retrieveImage(this.state.image.id)}}>
                        <DownloadIcon className={this.props.cartStyle || classes.iconButton}/>
                    </IconButton> :
                <IconButton color="secondary" dense="dense" onClick={(event) => {
                    event.preventDefault();
                    this.retrieveImage(this.state.image.id)
                    }}>
                    <DownloadIcon className={this.props.cartStyle || classes.iconButton}/>
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