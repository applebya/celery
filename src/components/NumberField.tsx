import React from 'react';
import NumberFormat from 'react-number-format';
import { TextField, TextFieldProps, InputAdornment } from '@material-ui/core';

interface NumberFormatCustomProps {
    inputRef: (instance: NumberFormat | null) => void;
    onChange: (event: { target: { value: number } }) => void;
}

const NumberFormatCustom: React.FC<NumberFormatCustomProps> = ({
    inputRef,
    onChange,
    ...other
}) => (
    <NumberFormat
        {...other}
        getInputRef={inputRef}
        onValueChange={values => {
            onChange({
                target: {
                    value: Number(values.value)
                }
            });
        }}
        thousandSeparator
        isNumericString
    />
);

const NumberField: React.FC<TextFieldProps> = ({ InputProps, ...rest }) => (
    <TextField
        InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
            inputComponent: NumberFormatCustom as any,
            ...InputProps
        }}
        {...rest}
    />
);

export default NumberField;
