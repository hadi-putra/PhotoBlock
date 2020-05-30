import React from 'react';
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import HomeIcon from '@material-ui/icons/Home'
import {Link, withRouter} from 'react-router-dom'
import Button from '@material-ui/core/Button';

const isActive = (history, path) => {
    if(history.location.pathname === path)
        return {color: '#bef67a'}
    else
        return {color: '#ffffff'}
}

const isPartActive = (history, path) => {
    if(history.location.pathname.includes(path))
        return {color: '#bef67a'}
    else
        return {color: '#ffffff'}
}

const Navbar = withRouter(({history}) => (
    <AppBar position="static">
        <Toolbar>
            <Typography type="title" color="inherit">
                PhotoBlock
            </Typography>
            <div>
                <Link to="/">
                    <IconButton aria-label="Home" style={isActive(history, "/")}>
                        <HomeIcon/>
                    </IconButton>
                </Link>
            </div>
            <div style={{'position':'absolute', 'right':'10px'}}>
                <span style={{'float':'right'}}>
                    <Link to="/image/new">
                        <Button style={isPartActive(history,"/image/new")}>Upload Image</Button>
                    </Link>
                    <Link to="/my-account">
                        <Button style={isActive(history,"/my-account")}>My Profile</Button>
                    </Link>
                </span>
            </div>
        </Toolbar>
    </AppBar>
))

export default Navbar;