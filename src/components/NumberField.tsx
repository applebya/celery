import React from 'react';
import NumberFormat from 'react-number-format';
import { TextField, TextFieldProps } from '@material-ui/core';
import styled from 'styled-components';

interface Props {
    inputRef: (instance: NumberFormat | null) => void;
    onChange: (event: { target: { value: number | null } }) => void;
    reversed?: boolean;
}

const NumberFormatCustom: React.FC<Props> = ({
    inputRef,
    onChange,
    ...rest
}) => (
    <NumberFormat
        getInputRef={inputRef}
        onValueChange={val => {
            onChange({
                target: {
                    value: val.floatValue || null
                }
            });
        }}
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
)``;

export default NumberField;
