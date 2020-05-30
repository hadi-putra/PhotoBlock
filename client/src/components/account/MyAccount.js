import React, { Component } from 'react'
import Typography from '@material-ui/core/Typography'
import Tab from '@material-ui/core/Tab'
import Tabs from '@material-ui/core/Tabs'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Divider from '@material-ui/core/Divider'
import {withStyles} from '@material-ui/core/styles'
import PhotoBlockToken from "./../../contracts/PhotoBlockToken.json"

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

            const currencyCode = await token.methods.symbol().call();
            const wallet = await token.methods.balanceOf(this.state.account).call();
            this.setState({currencyCode, wallet})
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
            tabIndex: 0
        }
        //this.handleChange = this.handleChange.bind(this)
    }

    handleChange = (e, index) => {
        console.log(index)
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
                    <Tabs indicatorColor="primary" textColor="primary" fullWidth variant="fullWidth"
                        value={this.state.tabIndex} onChange={this.handleChange}>
                        <Tab label="Image Uploaded"/>
                        <Tab label="Image Bought"/>
                    </Tabs>
                    <Divider/>
                </CardContent>
            </Card>
            
        </div>
        );
    }
}

export default withStyles(styles)(MyAccount)