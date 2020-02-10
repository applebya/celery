import React from 'react';
import NumberFormat from 'react-number-format';
import { TextField, TextFieldProps } from '@material-ui/core';
import styled, { css } from 'styled-components';

interface NumberFormatCustomProps {
    inputRef: (instance: NumberFormat | null) => void;
    onChange: (event: { target: { value: number } }) => void;
    reversed?: boolean;
}

const NumberFormatCustom: React.FC<NumberFormatCustomProps> = ({
    inputRef,
    onChange,
    ...rest
}) => (
    <NumberFormat
        getInputRef={inputRef}
        onValueChange={({ floatValue }) => {
            if (floatValue === 0) return;

            onChange({
                target: {
                    value: floatValue
                }
            });
        }}
        onKeyPressCapture={val => console.log(val)}
        thousandSeparator
        isNumericString
        {...rest}
    />
);

// TODO: Fix NumberField to type with these props
type NumberFieldProps = TextFieldProps & {
    reversed?: boolean;
    autoStretch?: boolean;
};

const NumberField = styled(
    ({ reversed, autoStretch, InputProps, ...props }) => (
        <TextField
            InputProps={{
                inputComponent: NumberFormatCustom as any,
                ...InputProps
            }}
            {...props}
        />
    )
)`
    ${({ autoStretch, value }) =>
        autoStretch &&
        css`
            width: ${100 + Number(value.length) * 5}px;
            max-width: ${100 + Number(value.length) * 5}px;
        `}

    ${({ reversed }) =>
        reversed &&
        css`
            input: {
                text-align: right;
            }
        `}
`;

export default NumberField;
