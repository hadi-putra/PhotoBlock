import React, { Component } from 'react'
import {Redirect} from 'react-router-dom'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardActions from '@material-ui/core/CardActions'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import FileUpload from '@material-ui/icons/AddPhotoAlternate'
import TextField from '@material-ui/core/TextField'
import InputAdornment from '@material-ui/core/InputAdornment'
import {withStyles} from '@material-ui/core/styles'
import ImageMarketplace from "./../../contracts/ImageMarketPlace.json"
import ipfs from"./../../ipfs";

const pathParse = require('path-parse');

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

class NewImage extends Component{

    componentDidMount = async()=>{
        try{
            const web3 = this.state.web3
            const networkId = await web3.eth.net.getId();

            const imageMarketplace = ImageMarketplace.networks[networkId];
            const marketplace = new web3.eth.Contract(
                ImageMarketplace.abi,
                imageMarketplace && imageMarketplace.address,
            );
            this.setState({marketplace, loading: false})
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
            web3: props.web3,
            marketplace: null,
            account: props.account,
            name: '',
            file: null,
            price: 0,
            redirect: false,
            loading: true,
            errors: {'file': false, 'price': false, 'name': false}
        }
        
        this.handleChange = this.handleChange.bind(this)
        this.clickSubmit = this.clickSubmit.bind(this)
    }

    handleChange = name => event => {
        event.preventDefault()
        const value = name === 'image' ? event.target.files[0] : event.target.value
        const _errors = this.state.errors
        
        if(name === 'image'){
            _errors['file'] = _errors['name'] = false
            this.setState(() => ({name: !this.state.name? pathParse(value.name).name : this.state.name, file: value}))
        } else if (name === 'price') {
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
        _errors['file'] = !this.state.file
        _errors['name'] = !this.state.name
        _errors['price'] = !this.state.price || this.state.price <= 0

        this.setState({errors : _errors})
        
        if(Object.values(_errors).every(item => item === false)){
            this.setState({loading: true})
            const options = {
                progress: (prog) => console.log(`received: ${prog}`)
            }
            const source = ipfs.add(this.state.file, options)
            const pathparse = pathParse(this.state.file.name)
            const ext = pathparse.ext
            const mime = this.state.file.type

            this.processIPFS(source, this.state.name, this.state.price, ext, mime)
        }
        
    }

    async processIPFS(source, _name, _price, _fileExt, _fileMime){
        try {
          for await (const file of source) {
            this.state.marketplace.methods.createImage(_name, _price, file.cid.toString(), _fileExt, _fileMime)
              .send({from: this.state.account })
              .once('receipt', (receipt) => {
                /*var created = receipt.events.ImageCreated.returnValues
                created.purchased = false
                this.setState({
                  images: [...this.state.images, created]
                })*/
                this.setState({loading: false, redirect: true})
              })
          }
        } catch (err) {
          console.error(err)
        }
      }

    render(){
        if(this.state.redirect){
            return (<Redirect to={'/my-account'}/>)
        }
        const {classes} = this.props
        return (<div>
            <Card className={classes.card}>
                <CardContent>
                    <Typography type="headline" component="h2" className={classes.title}>
                        New Image
                    </Typography>
                    <br/>
                    <input accept="image/*" onChange={this.handleChange('image')} className={classes.input} id="icon-button-file" type="file" required/>
                    <label htmlFor="icon-button-file">
                        <Button variant="contained" color="secondary" component="span">
                            Upload Image
                            <FileUpload/>
                        </Button>
                    </label><br/>
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
                    {
                        this.state.errors['file'] && (<Typography component="p" color="error">
                            You haven't uploaded an image!
                        </Typography>)
                    }
                </CardContent>
                <CardActions>
                    <Button color="primary" variant="contained" onClick={this.clickSubmit} className={classes.submit}>Submit</Button>
                </CardActions>
            </Card>
        </div>)
    }
}

export default withStyles(styles)(NewImage)