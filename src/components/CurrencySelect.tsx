import React from 'react';
import { Select, MenuItem, SelectProps } from '@material-ui/core';
import styled from 'styled-components';
import { CurrencyType } from '../services/types';
import FlagImage from './FlagImage';

const StyledSelect = styled(Select)`
    max-width: 7em;
`;

// TODO: Group currencies by continent?
const CurrencySelect: React.FC<SelectProps> = props => (
    <StyledSelect {...props}>
        {Object.values(CurrencyType).map(currencyCode => (
            <MenuItem key={currencyCode} value={currencyCode}>
                <FlagImage currencyCode={currencyCode} />
                {currencyCode}
            </MenuItem>
        ))}
    </StyledSelect>
);

export default CurrencySelect;
