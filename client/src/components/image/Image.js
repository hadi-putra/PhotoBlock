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
import ipfs from'./../../ipfs';
import ImageMarketplace from "./../../contracts/ImageMarketPlace.json"
import Button from '@material-ui/core/Button'

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
    }
})

class Image extends Component {
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
            const imageStat = await marketplace.methods.stats(this.state.id).call();
            //const reviews = await marketplace.methods.reviews(this.state.id).call();
            //const hasReviewed = await marketplace.methods.hasReviewed(this.state.account, this.state.id).call();
            
            if (parseInt(image.status !== 1)){
                this.setState({redirect: true})
                return;
            }

            if(image.owner !== this.state.account){
                image.purchased = await marketplace.methods.imagesPaid(this.state.account, this.state.id).call();
            }


            this.setState({marketplace, image, imageStat,  /*hasReviewed,*/ loading: false})
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
            hasReviewed: true,
            isOpenDialog: false,
            ratingValue: 0,
            reviewDesc: '',
            loading: true
        }
        this.closeDialog = this.closeDialog.bind(this);
        this.submitReview = this.submitReview.bind(this);
    }

    closeDialog = event => {
        this.setState({isOpenDialog: false})
    }

    submitReview = event => {
        this.setState({isOpenDialog: false})
        if(parseInt(this.state.ratingValue) < 1 || parseInt(this.state.ratingValue) > 5)
            return;
        this.state.marketplace.methods.postRate(this.state.id, this.state.reviewDesc, this.state.ratingValue)
            .send({from: this.state.account})
            .once('receipt', receipt => {
                console.log('receipt', receipt);
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
                        !this.state.image.purchased ?
                            <IconButton color="secondary" dense="dense" onClick={(event) => {
                                event.preventDefault();
                                this.purchaseImage(this.state.image)
                            }}>
                                <AddToCartIcon />
                            </IconButton> :
                            <IconButton color="secondary" dense="dense" onClick={(event) => {
                                event.preventDefault();
                                this.retrieveImage(this.state.image.id)}}>
                                <DownloadIcon />
                            </IconButton> :
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
                    </Typography>
                </div>
            </Card>
            <Paper elevation={1} className={classes.paper}>
                <div className={classes.review}>
                    <div className={classes.reviewHeader}>
                        <Typography variant="h5" className={classes.reviewHeaderTitle}>Reviews</Typography>
                        {
                            this.state.hasReviewed && <Button variant="outlined" color="primary" onClick={(event) => {
                                event.preventDefault();
                                this.setState({isOpenDialog: true})
                            }}>Leave Review</Button>
                        }
                    </div>
                    <div style={{'marginTop': '16px'}}>

                    </div>
                </div>
            </Paper>
        </div>);
    }
}

export default withStyles(styles)(Image);