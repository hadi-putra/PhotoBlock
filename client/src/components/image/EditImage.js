import React, { Component } from 'react'
import {Redirect} from 'react-router-dom'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardActions from '@material-ui/core/CardActions'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import InputAdornment from '@material-ui/core/InputAdornment'
import {withStyles} from '@material-ui/core/styles'
import ImageMarketplace from "./../../contracts/ImageMarketPlace.json"

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
    title: {
        marginTop: theme.spacing(2),
        color: theme.palette.openTitle,
        fontSize: '1em'
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
    filename:{
        marginLeft:'10px'
    }
})

class EditImage extends Component {

    componentDidMount = async()=>{
        try{
            const web3 = this.state.web3
            const networkId = await web3.eth.net.getId();

            const imageMarketplace = ImageMarketplace.networks[networkId];
            const marketplace = new web3.eth.Contract(
                ImageMarketplace.abi,
                imageMarketplace && imageMarketplace.address,
            );

            const image = await marketplace.methods.images(this.state.id).call();
            
            if (image.owner !== this.state.account){
                this.setState({redirect: true})
                return;
            }
            this.setState({marketplace, name: image.name, price: image.price, loading: false})
        } catch(error){
            alert(
                `Failed to load web3, accounts, or contract. Check console for details.`,
              );
            console.error(error);
        }
    }

    constructor(props){
        super(props)
        this.state = {
            web3: this.props.web3,
            account: this.props.account,
            id: this.props.match.params.imageId,
            redirect: false,
            name: '',
            price: 0,
            marketplace: null,
            loading: true,
            errors: {'price': false, 'name': false}
        }
        this.handleChange = this.handleChange.bind(this)
        this.clickSubmit = this.clickSubmit.bind(this)
    }

    handleChange = name => event => {
        event.preventDefault()
        const value = event.target.value
        const _errors = this.state.errors
        
        if (name === 'price') {
            const _int = parseInt(value)
            
            _errors['price'] = !_int || _int <= 0
            this.setState({price: value})
        } else {
            _errors[name] = !value
            this.setState({[name]: value})
        }
        this.setState({errors: _errors})
    }

    clickSubmit(event){
        event.preventDefault()
        const _errors = this.state.errors
        _errors['name'] = !this.state.name
        _errors['price'] = !this.state.price || this.state.price <= 0

        this.setState({errors : _errors})
        
        if(Object.values(_errors).every(item => item === false)){
            this.setState({loading: true})
            this.state.marketplace.methods.editImageDescr(this.state.id, this.state.name, 
                this.state.price)
                .send({from: this.state.account })
                .once('receipt', (receipt) => {
                    console.log(receipt)
                    this.setState({loading: false, redirect: true})
                });
        }
        
    }

    render(){
        if(this.state.redirect){
            return (<Redirect to={'/my-account'}/>)
        }
        const {classes} = this.props
        return(
        <Card className={classes.card}>
            <CardContent>
                <Typography type="headline" component="h2" className={classes.title}>
                    Edit Image
                </Typography>
                <br/>
                <TextField id="name" label="Name" onChange={this.handleChange('name')} 
                    className={classes.textField} value={this.state.name} margin="normal" required
                    error={this.state.errors['name']} helperText={this.state.errors['name'] ? "name is required" : null}/><br/>
                <TextField id="price" label="Price" onChange={this.handleChange('price')} 
                    className={classes.textField} value={this.state.price} margin="normal" required props={{min: "1"}}
                    InputProps={{
                        endAdornment: <InputAdornment position="end">PBCoin</InputAdornment>,
                    }}
                    error={this.state.errors['price']} helperText={this.state.errors['price'] ? "price is required": null}/>
                <br/>
            </CardContent>
            <CardActions>
                <Button color="primary" variant="contained" onClick={this.clickSubmit} className={classes.submit}>Submit</Button>
            </CardActions>
        </Card>);
    }
}

export default withStyles(styles)(EditImage);