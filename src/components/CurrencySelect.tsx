import React from 'react';
import { Select, MenuItem, SelectProps } from '@material-ui/core';
import { CurrencyType } from '../services/types';
import FlagImage from './FlagImage';

// TODO: Group currencies by continent?
const CurrencySelect: React.FC<SelectProps> = props => (
    <Select {...props}>
        {Object.values(CurrencyType).map(currencyCode => (
            <MenuItem key={currencyCode} value={currencyCode}>
                <FlagImage currencyCode={currencyCode} />
                {currencyCode}
            </MenuItem>
        ))}
    </Select>
);

export default CurrencySelect;
