import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {withStyles} from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import {GridList, GridListTile, GridListTileBar} from '@material-ui/core'
import ImageAction from './../action/ImageAction'
import {Link} from 'react-router-dom'

const styles = theme => ({
    root: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'space-around',
      overflow: 'hidden',
      background: theme.palette.background.paper,
      textAlign: 'left',
      padding: '0 8px'
    },
    container: {
      minWidth: '100%',
      paddingBottom: '14px'
    },
    gridList: {
      width: '100%',
      minHeight: 200,
      padding: '16px 0 10px'
    },
    title: {
      padding:`${theme.spacing(3)}px ${theme.spacing(2.5)}px ${theme.spacing(2)}px`,
      color: theme.palette.openTitle,
      width: '100%'
    },
    tile: {
      textAlign: 'center'
    },
    image: {
      height: '100%'
    },
    tileBar: {
      backgroundColor: 'rgba(0, 0, 0, 0.72)',
      textAlign: 'left'
    },
    tileTitle: {
      fontSize:'1.1em',
      marginBottom:'5px',
      color:'rgb(189, 222, 219)',
      display:'block'
    }
  })

class Images extends Component {
    render(){
        const {classes} = this.props
        return (
            <div className={classes.root}>
                {this.props.images.length > 0 ?
                (<div className={classes.container}>
                    <GridList cellHeight={200} className={classes.gridList} cols={4}>
                        {this.props.images.map((image, i) => (
                            <GridListTile key={i} className={classes.tile}>
                                <Link to={"/image/"+image.id}>
                                    <img className={classes.image} src={`http://127.0.0.1:8080/ipfs/${image.ipfsHash}`} alt={image.name}/>
                                </Link> 
                                <GridListTileBar className={classes.tileBar}
                                    title={<Link to={"/image/"+image.id} className={classes.tileTitle}>{image.name}</Link>}
                                    subtitle={<span>{image.price} {this.props.currencyCode}</span>}
                                    actionIcon={
                                      <ImageAction image={image} 
                                        web3={this.props.web3}
                                        marketplace={this.props.marketplace}
                                        token={this.props.token}
                                        account={this.props.account}/>
                                    }/>
                            </GridListTile>
                        ))}
                    </GridList>
                </div>) : 
                (<Typography type="subheading" component="h4" className={classes.title}>No Images found! :(</Typography>)
                }
            </div>
        )
    }
}

Images.propTypes = {
    classes: PropTypes.object.isRequired,
    images: PropTypes.array.isRequired,
    currencyCode: PropTypes.string.isRequired
}

export default withStyles(styles)(Images)