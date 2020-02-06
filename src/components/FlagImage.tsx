import React from 'react';
import styled from 'styled-components';
import { CurrencyType } from '../services/types';

interface Props {
    currencyCode: CurrencyType;
}

const FlagImage = styled(({ currencyCode = '', ...rest }) => (
    <img
        src={`./flags/${currencyCode.toLowerCase()}.png`}
        alt={currencyCode}
        {...rest}
    />
))<Props>`
    height: 16px;
    margin-right: 8px;
`;

export default FlagImage;
