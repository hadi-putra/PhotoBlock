import React, { Component } from 'react'
import Typography from '@material-ui/core/Typography'
import Tab from '@material-ui/core/Tab'
import Tabs from '@material-ui/core/Tabs'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Grid from '@material-ui/core/Grid'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemAvatar from '@material-ui/core/ListItemAvatar'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import Avatar from '@material-ui/core/Avatar'
import Paper from '@material-ui/core/Paper'
import Divider from '@material-ui/core/Divider'
import Box from '@material-ui/core/Box'
import {withStyles} from '@material-ui/core/styles'
import IconButton from '@material-ui/core/IconButton'
import DownloadIcon from '@material-ui/icons/CloudDownload'
import EditIcon from '@material-ui/icons/Edit'
import PublishIcon from '@material-ui/icons/Publish'
import ArchieveIcon from '@material-ui/icons/Archive'
import {Link} from 'react-router-dom'
import PhotoBlockToken from "./../../contracts/PhotoBlockToken.json"
import ImageMarketplace from "./../../contracts/ImageMarketPlace.json"
import PropTypes from 'prop-types'

const styles = theme => ({
    root: {
        flexGrow: 1,
        margin: 30
      },
    paper: theme.mixins.gutters({
        paddingBottom: '24px',
        backgroundColor: '#80808024'
    }),
    card: {
        width: '100%',
    },
    details: {
        display: 'inline-block',
        width: "100%"
    },
    content: {
        flex: '1 0 auto',
        padding: '16px 8px 0px'
    },
    title: {
        margin: `${theme.spacing(1)}px 0 ${theme.spacing(1)}px`,
        color: theme.palette.openTitle,
        fontSize: '1.1em'
    }
})

function a11yProps(index) {
    return {
      id: `full-width-tab-${index}`,
      'aria-controls': `full-width-tabpanel-${index}`,
    };
}

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <Box p={3}
          role="tabpanel"
          hidden={value !== index}
          id={`full-width-tabpanel-${index}`}
          aria-labelledby={`full-width-tab-${index}`}
          {...other}
        >
          {children}
        </Box>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
  };

class MyAccount extends Component {

    componentDidMount = async() => {
        try {
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

            const currencyCode = await token.methods.symbol().call();
            const wallet = await token.methods.balanceOf(this.state.account).call();

            const idsUploaded = await marketplace.methods.imagesUploaded().call({from: this.state.account});
            for(var i = 0; i < idsUploaded.length; i++){
                const image = await marketplace.methods.images(idsUploaded[i]).call();
                image.purchased = true;

                this.setState({
                    imageUploaded: [...this.state.imageUploaded, image]
                })
            }

            const idsBought = await marketplace.methods.imagesBought().call({from: this.state.account});
            for(i = 0; i < idsBought.length; i++){
                const image = await marketplace.methods.images(idsBought[i]).call();
                image.purchased = true;

                this.setState({
                    imageBought: [...this.state.imageBought, image]
                })
            }

            this.setState({marketplace, currencyCode, wallet})
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
            account: props.account,
            currencyCode: '',
            wallet: 0,
            tabIndex: 0,
            marketplace: null,
            imageUploaded: [],
            imageBought: []
        }
        this.editVisibilityImage = this.editVisibilityImage.bind(this)
    }

    editVisibilityImage = (_index, _status) => event => {
        event.preventDefault();
        const images = this.state.imageUploaded
        const image = images[_index]
        this.state.marketplace.methods.editImageDescr(image.id, image.name, 
            image.price, _status)
            .send({from: this.state.account })
            .once('receipt', (receipt) => {
                console.log(receipt)
                images[_index].status = _status
                this.setState({imageUploaded: images})
                //this.setState({loading: false, redirect: true})
            });
    }

    handleChange = (e, index) => {
        this.setState({tabIndex: index})
    }
    

    render(){
        const {classes} = this.props
        return(
        <div className={classes.root}>
           <Paper className={classes.paper} elevation={4}>
                <Typography type="title" className={classes.title}>My Account</Typography>
                <span>
                    <Card className={classes.card}>
                        <div className={classes.details}>
                            <CardContent className={classes.content}>
                                <Grid container spacing={2}>
                                    <Grid item xs={2} sm={2}>
                                        <Typography type="title" component="h3" color="primary">Address</Typography>
                                        <Typography type="title" component="h3" color="primary">Balance</Typography>
                                    </Grid>
                                    <Grid item xs={10} sm={10}>
                                        <Typography type="subheading">{this.state.account}</Typography>
                                        <Typography type="subheading">{this.state.wallet+' '+this.state.currencyCode}</Typography>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </div>
                    </Card>
                </span>
            </Paper>
            <br/>
            <Card className={classes.card}>
                <CardContent className={classes.content}>
                    <Tabs indicatorColor="primary" textColor="primary" variant="fullWidth"
                        value={this.state.tabIndex} onChange={this.handleChange} aria-label="full width tabs example">
                        <Tab label="Image Uploaded" {...a11yProps(0)} />
                        <Tab label="Image Bought"{...a11yProps(1)}/>
                    </Tabs>
                    <Divider/>
                    <TabPanel value={this.state.tabIndex} index={0}>
                        {this.state.imageUploaded.length > 0 ? 
                            <List dense>
                                {this.state.imageUploaded.map((image, index) => {
                                    return <span key={index}>
                                        <ListItem button>
                                            <ListItemAvatar>
                                                <Avatar src={`http://127.0.0.1:8080/ipfs/${image.ipfsHash}`}/>
                                            </ListItemAvatar>
                                            <ListItemText primary={image.name} secondary={image.price+" PBcoin"}/>
                                            <ListItemSecondaryAction>
                                                {parseInt(image.status) !== 1 ? 
                                                    <IconButton aria-label="Publish" color="primary" onClick={this.editVisibilityImage(index, 1)}><PublishIcon/></IconButton> 
                                                    : null}
                                                {parseInt(image.status) !== 2 ? 
                                                    <IconButton aria-label="Archieve" color="primary" onClick={this.editVisibilityImage(index, 2)}><ArchieveIcon/></IconButton> 
                                                    : null}
                                                <Link to={"/image/edit/"+image.id}>
                                                    <IconButton aria-label="Edit" color="primary"><EditIcon/></IconButton>
                                                </Link>
                                                <IconButton aria-label="Download" color="primary"><DownloadIcon/></IconButton>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                        <Divider/>
                                    </span>
                                })}
                            </List>:
                            <Typography type="subheading" component="h4">No Images found! :(</Typography>    
                        }
                    </TabPanel>
                    <TabPanel value={this.state.tabIndex} index={1}>
                    {this.state.imageBought.length > 0 ? 
                            <List dense>
                                {this.state.imageBought.map((image, index) => {
                                    return <span key={index}>
                                        <ListItem button>
                                            <ListItemAvatar>
                                                <Avatar src={`http://127.0.0.1:8080/ipfs/${image.ipfsHash}`}/>
                                            </ListItemAvatar>
                                            <ListItemText primary={image.name} secondary={image.price+" PBcoin"}/>
                                            <ListItemSecondaryAction>
                                                <IconButton aria-label="Download" color="primary"><DownloadIcon/></IconButton>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                        <Divider/>
                                    </span>
                                })}
                            </List>:
                            <Typography type="subheading" component="h4">No Images found! :(</Typography>    
                        }
                    </TabPanel>
                </CardContent>
            </Card>
            
        </div>
        );
    }
}

export default withStyles(styles)(MyAccount)