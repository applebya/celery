import { createGlobalStyle } from 'styled-components';
import { ThemeType } from './theme';

// Style overrides
const GlobalStyle = createGlobalStyle<{ theme: ThemeType }>`
    .MuiInputBase-root {
        :before {
            border-bottom: 1px dashed ${p => {
                return p.theme.palette.text.primary;
            }};
            opacity: 0.5;
        }
    }
`;

export default GlobalStyle;
