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
            light: '#8eacbb',
            main: '#607d8b',
            dark: '#34515e',
            contrastText: '#fff',
        },
        secondary: {
            light: '#e7ff8c',
            main: '#b2ff59',
            dark: '#7ecb20',
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
