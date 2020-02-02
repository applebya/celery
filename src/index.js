import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';

import CssBaseline from '@material-ui/core/CssBaseline';
import {
    ThemeProvider,
    createMuiTheme,
    responsiveFontSizes
} from '@material-ui/core/styles';

// A custom theme for this app
let theme = createMuiTheme({
    palette: {
        common: { black: 'rgba(0, 0, 0, 1)', white: '#fff' },
        background: {
            paper: 'rgba(255, 255, 255, 1)',
            default: 'rgba(239, 239, 239, 1)'
        },
        primary: {
            light: 'rgba(175, 238, 107, 1)',
            main: 'rgba(97, 186, 0, 1)',
            dark: 'rgba(65, 117, 5, 1)',
            contrastText: '#fff'
        },
        secondary: {
            light: 'rgba(175, 238, 107, 1)',
            main: 'rgba(97, 186, 0, 1)',
            dark: 'rgba(65, 117, 5, 1)',
            contrastText: '#fff'
        },
        error: {
            light: '#e57373',
            main: '#f44336',
            dark: '#d32f2f',
            contrastText: '#fff'
        },
        text: {
            primary: 'rgba(59, 59, 59, 0.87)',
            secondary: 'rgba(73, 73, 73, 0.6)',
            disabled: 'rgba(0, 0, 0, 0.38)',
            hint: 'rgba(0, 0, 0, 0.38)'
        }
    }
});

theme = responsiveFontSizes(theme);

ReactDOM.render(
    <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
    </ThemeProvider>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
