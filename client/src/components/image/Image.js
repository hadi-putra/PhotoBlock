import React, { Component } from 'react'
import {Redirect, Link} from 'react-router-dom'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardMedia from '@material-ui/core/CardMedia'
import Typography from '@material-ui/core/Typography'
import {withStyles} from '@material-ui/core/styles'
import IconButton from '@material-ui/core/IconButton'
import DownloadIcon from '@material-ui/icons/CloudDownload'
import AddToCartIcon from '@material-ui/icons/AddShoppingCart'
import EditIcon from '@material-ui/icons/Edit'
import Paper from '@material-ui/core/Paper'
import Rating from '@material-ui/lab/Rating'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import TextAreaAutoSize from '@material-ui/core/TextareaAutosize'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Divider from '@material-ui/core/Divider'
import Button from '@material-ui/core/Button'
import {retrieveImage, purchaseImage} from './../action/ImageActionApi';
import ImageMarketplace from "./../../contracts/ImageMarketPlace.json"
import PhotoBlockToken from "./../../contracts/PhotoBlockToken.json"

const styles = theme => ({
    root: {
        flexGrow: 1,
        margin: 30
    },
    flex:{
        display:'flex'
    },
    card: {
        padding:'24px 40px 40px'
    },
    media: {
        height: 350,
        display: 'inline-block',
        width: '50%',
        marginLeft: '24px'
    },
    subheading: {
        margin: '24px',
        color: theme.palette.openTitle
      },
    price: {
        padding: '16px',
        margin: '16px 0px',
        display: 'flex',
        backgroundColor: '#93c5ae3d',
        fontSize: '1.3em',
        color: '#375a53',
      },
    action: {
        margin: '8px 24px',
        display: 'inline-block'
    },
    paper: {
        flex: '1 1 auto',
        marginTop: '10px'
    },
    review: {
        padding: '8px 16px'
    },
    reviewHeader: {
        display: 'flex',
        alignItems: 'center',
    },
    reviewHeaderTitle: {
        flexGrow: 1
    },
    listContent: {
        marginTop: '24px'
    }
})

class Image extends Component {
    componentDidMount = async()=>{
        try{
            const web3 = this.state.web3
            const networkId = await web3.eth.net.getId();

            const tokenData = PhotoBlockToken.networks[networkId];
            const token = new web3.eth.Contract(
                PhotoBlockToken.abi,
                tokenData && tokenData.address,
            );

            const imageMarketplace = ImageMarketplace.networks[networkId];
            const marketplace = new web3.eth.Contract(
                ImageMarketplace.abi,
                imageMarketplace && imageMarketplace.address,
            );

            const image = await marketplace.methods.images(this.state.id).call();
            const imageStat = await marketplace.methods.stats(this.state.id).call();
            
            const hasReviewed = await marketplace.methods.haveReviewed(this.state.account, this.state.id).call();
            console.log("reviews",hasReviewed)
            const reviews = await marketplace.methods.imagesReviews(this.state.id).call();
            for (var i = 0; i < reviews.length; i++){
                const review = await marketplace.methods.reviews(reviews[i]).call()
                this.setState({
                    reviews: [...this.state.reviews, review]
                })
            }

            if (parseInt(image.id) === 0 || (parseInt(image.status) !== 1 && image.owner !== this.state.account)){
                this.setState({redirect: true})
                return;
            }

            if(image.owner !== this.state.account){
                image.purchased = await marketplace.methods.imagesPaid(this.state.account, this.state.id).call();
            }


            this.setState({marketplace, token, image, imageStat,  hasReviewed, loading: false})
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
            image: null,
            imageStat: null,
            reviews: [],
            redirect: false,
            marketplace: null,
            token: null,
            hasReviewed: false,
            isOpenDialog: false,
            ratingValue: 0,
            reviewDesc: '',
            loading: true
        }
        this.closeDialog = this.closeDialog.bind(this);
        this.submitReview = this.submitReview.bind(this);
        this.buyImage = this.buyImage.bind(this);
    }

    handleDownload = ()=>{
        retrieveImage(this.state.image)
    }

    buyImage = async(event)=>{
        event.preventDefault()
        purchaseImage(this.state.image, this.state.marketplace, this.state.token, 
            this.state.account, this.state.web3)
            .once('receipt', (receipt) => {
                const _image = this.state.image
                _image.purchased = true
                this.setState({image: _image})
            }).catch(error => {
                console.error(error.message)
            })
    } 

    closeDialog = event => {
        this.setState({isOpenDialog: false})
    }

    submitReview = event => {
        this.setState({isOpenDialog: false})
        if(parseInt(this.state.ratingValue) < 1 || parseInt(this.state.ratingValue) > 5)
            return;
        
        const _datePost = parseInt(new Date().getTime()/1000)
        this.state.marketplace.methods.postRate(this.state.id, this.state.reviewDesc, this.state.ratingValue, _datePost)
            .send({from: this.state.account})
            .once('receipt', receipt => {
                console.log('receipt', receipt);
                const _event = receipt.events.ImageReviewed.returnValues
                let imgStat = this.state.imageStat
                imgStat.totalRate = parseInt(imgStat.totalRate) + parseInt(this.state.ratingValue)
                imgStat.total = parseInt(imgStat.total) + 1
                let _review = {
                    id : _event.id,
                    by : _event.by,
                    content: _event.content,
                    rate: parseInt(_event.rating),
                    datePost: _event.datePost
                }
                this.setState({
                    reviews: [...this.state.reviews, _review],
                    hasReviewed: true,
                    ratingValue: 0,
                    reviewDesc: ''
                })
            }).catch(error => {
                console.error(error);
            });
    }

    render(){
        if (this.state.redirect){
            return (<Redirect to={'/'}/>)
        }
        if (!this.state.marketplace)
            return <div>Loading contract...</div>;

        const {classes} = this.props
        return(<div className={classes.root}>
            <Dialog open={this.state.isOpenDialog} onClose={this.closeDialog} aria-labelledby="form-dialog-title" fullWidth={true}>
                <DialogTitle id="form-dialog-title">Leave a review</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        How was this image for you?
                    </DialogContentText>
                    <Typography component="legend">Your rating</Typography>
                    <Rating name="controlled" value={this.state.ratingValue}
                        onChange={(event, newValue) => {
                            this.setState({ratingValue: newValue})
                        }}/>
                    <Typography component="legend">Description</Typography>
                    <TextAreaAutoSize aria-label="review-description" rowsMin={3}
                        rowsMax={3} placeholder="Your review detail" style={{'width':'100%'}}
                        value={this.state.reviewDesc} onChange={event => {
                            this.setState({reviewDesc: event.target.value})
                        }}/>
                </DialogContent>
                <DialogActions>
                    <Button color="secondary" onClick={this.closeDialog}>Cancel</Button>
                    <Button color="primary" onClick={this.submitReview} disabled={this.state.ratingValue === 0}>Submit</Button>
                </DialogActions>
            </Dialog>
            <Card className={classes.card}>
                <CardHeader
                    title={this.state.image.name}
                    action={<span className={classes.action}>
                        {(this.state.image.owner !== this.state.account) ?
                            null :
                            <Link to={"/image/edit/"+this.state.image.id}>
                                <IconButton color="secondary" dense="dense">
                                    <EditIcon />
                                </IconButton>
                            </Link>
                        }
                        </span>
                    }
                />
                <div className={classes.flex}>
                    <CardMedia className={classes.media} image={`http://127.0.0.1:8080/ipfs/${this.state.image.ipfsHash}`}
                        title={this.state.image.name}/>
                    <Typography component="p" variant="subtitle1" className={classes.subheading}>
                        {
                            parseInt(this.state.imageStat.total) === 0? "No Rating Yet" :
                            "Rating: "+(this.state.imageStat.totalRate / this.state.imageStat.total).toFixed(2)+" ("+this.state.imageStat.total+" Review)"
                        }
                        <span className={classes.price}>{this.state.image.price+' PBCoin'}</span>
                        {
                            this.state.image.owner === this.state.account || this.state.image.purchased ? 
                                <Button variant="contained" color="primary" startIcon={<DownloadIcon/>} size="large" 
                                    onClick={this.handleDownload}>Download</Button>
                            :  <Button variant="contained" color="primary" startIcon={<AddToCartIcon/>} size="large"
                                    onClick={this.buyImage}>Buy</Button>
                        }
                        
                    </Typography>
                </div>
            </Card>
            <Paper elevation={1} className={classes.paper}>
                <div className={classes.review}>
                    <div className={classes.reviewHeader}>
                        <Typography variant="h5" className={classes.reviewHeaderTitle}>Reviews</Typography>
                        {
                            this.state.image.owner !== this.state.account && this.state.image.purchased && !this.state.hasReviewed && 
                            <Button variant="outlined" color="primary" onClick={(event) => {
                                event.preventDefault();
                                this.setState({isOpenDialog: true})
                            }}>Leave Review</Button>
                        }
                    </div>
                    <div style={{'marginTop': '16px'}}>
                        {
                            this.state.reviews.length > 0 ?
                            <List>
                                {
                                    this.state.reviews.map((item, index) => {
                                        return <span key={index}>
                                            <ListItem>
                                                <ListItemText
                                                    classes={{ secondary: classes.listContent }}
                                                    primary={'By '+item.by}
                                                    secondary={
                                                        <span>
                                                            <Rating name={"read-only-"+item.id} value={parseInt(item.rate)} size="small" readOnly/><br/>
                                                            <Typography component="span">{item.content}</Typography><br/>
                                                            <Typography component="span" type="subheading">{new Date(item.datePost*1000).toLocaleDateString()}</Typography>
                                                        </span>
                                                    }
                                                />
                                            </ListItem>
                                            <Divider/>
                                        </span>
                                    })
                                }
                            </List>
                            :<Typography type="subheading" component="h4">No Review yet! :(</Typography>
                        }
                    </div>
                </div>
            </Paper>
        </div>);
    }
}

export default withStyles(styles)(Image);