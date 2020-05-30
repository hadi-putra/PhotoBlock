import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter} from 'react-router-dom';
import {MuiThemeProvider, createMuiTheme} from '@material-ui/core/styles'
import { blueGrey, lightGreen } from '@material-ui/core/colors'
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

const theme = createMuiTheme({
    palette: {
        primary: {
            light: '#428d90',
            main: '#005f63',
            dark: '#003539',
            contrastText: '#fff',
        },
        secondary: {
            light: '#ffad42',
            main: '#f57c00',
            dark: '#bb4d00',
            contrastText: '#000'
        },
        openTitle: blueGrey['400'],
        protectedTitle: lightGreen['400'],
        type: 'light'
    }
});

ReactDOM.render(
    <BrowserRouter>
        <MuiThemeProvider theme={theme}><App /></MuiThemeProvider>
    </BrowserRouter>
    , document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
