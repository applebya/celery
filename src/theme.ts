import { createMuiTheme, responsiveFontSizes } from '@material-ui/core/styles';

const theme = createMuiTheme({
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

export type ThemeType = typeof theme;

export default responsiveFontSizes(theme);
