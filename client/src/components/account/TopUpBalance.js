import React, { Component } from 'react'
import {Redirect} from 'react-router-dom'
import {withStyles} from '@material-ui/core/styles'
import PhotoBlockToken from "./../../contracts/PhotoBlockToken.json"
import ImageMarketplace from "./../../contracts/ImageMarketPlace.json"
import { Card, Typography, CardContent, TextField, InputAdornment, CardActions, Button } from '@material-ui/core'

const styles = theme => ({
    card: {
        maxWidth: 600,
        margin: 'auto',
        textAlign: 'center',
        marginTop: theme.spacing(5),
        paddingBottom: theme.spacing(2)
    },
    error: {
        verticalAlign: 'middle'
    },
    textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        width: 300
    },
    submit: {
        margin: 'auto',
        marginBottom: theme.spacing(2)
    },
    input: {
        display: 'none'
    },
})

class TopUpBalance extends Component {

    componentDidMount = async() => {
        try {
            const web3 = this.state.web3
            const networkId = await web3.eth.net.getId();

            const tokenData = PhotoBlockToken.networks[networkId];
            const token = new web3.eth.Contract(
                PhotoBlockToken.abi,
                tokenData && tokenData.address,
            );

            const currency = await token.methods.symbol().call();
            const mybalance = await token.methods.balanceOf(this.state.account).call()
            
            const imageMarketplace = ImageMarketplace.networks[networkId];
            const marketplace = new web3.eth.Contract(
                ImageMarketplace.abi,
                imageMarketplace && imageMarketplace.address,
            );

            const tokenPrice = await marketplace.methods.tokenPrice().call()
            
            this.setState({marketplace, token, currency, mybalance, tokenPrice})
        } catch (error) {
            alert(
                `Failed to load web3, accounts, or contract. Check console for details.`,
            );
            console.error(error);
        }
    }

    constructor(props){
        super(props)
        this.state = {
            web3: props.web3,
            account: props.account,
            marketplace: null,
            token: null,
            currency: '',
            topupAmount: 1,
            mybalance: 0,
            tokenPrice: 0,
        }
        this.buyToken = this.buyToken.bind(this)
    }

    buyToken = event => {
        event.preventDefault();
        this.state.marketplace.methods.buyTokens(this.state.topupAmount)
            .send({from: this.state.account, value: this.state.topupAmount * this.state.tokenPrice})
            .once('receipt', (receipt) => {
                console.log(receipt)
                this.setState({topupAmount: 1, mybalance: parseInt(this.state.mybalance) + parseInt(receipt.events.Sell.returnValues._amount)})
            }).catch((error) => {
                console.error(error)
            })
    }

    isValidNumber = (number) => {
        const _int = parseInt(number)
        return _int && (_int > 0)
    }

    render(){
        if(this.state.redirect){
            return (<Redirect to={'/'}/>)
        }
        const {classes} = this.props
        return(
        <Card className={classes.card}>
            <CardContent>
                <Typography component="h1" variant="h6" color="primary">{'Current Balance: '+this.state.mybalance+' '+this.state.currency}</Typography>
                <Typography variant="subtitle1">{'Price: '+this.state.web3.utils.fromWei(this.state.tokenPrice.toString(), 'ether')+' Ether'}</Typography>

                <TextField id="amount" className={classes.textField} value={this.state.topupAmount}
                    label="Amount" required props={{min:1}} onChange={event => {
                        event.preventDefault();
                        this.setState({topupAmount: event.target.value})
                    }}
                    InputProps={{
                        endAdornment: <InputAdornment position="end">{this.state.currency}</InputAdornment>
                    }}
                    error={!this.isValidNumber(this.state.topupAmount)}
                    helperText={this.isValidNumber(this.state.topupAmount)? null : "Invalid number"}/>
            </CardContent>
            <CardActions>
                <Button color="primary" variant="contained" className={classes.submit} onClick={this.buyToken}
                    disabled={!this.isValidNumber(this.state.topupAmount)}>Top Up</Button>
            </CardActions>
        </Card>
        )
    }
}

export default withStyles(styles)(TopUpBalance);