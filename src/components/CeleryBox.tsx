import React, { useEffect, useRef } from 'react';
import {
    Box,
    Button,
    Grid,
    TextField,
    Select,
    MenuItem,
    InputAdornment
} from '@material-ui/core';
import { Delete } from '@material-ui/icons';
import CountUp from 'react-countup';
import calculateSalary from '../utils/calculateSalary';
import NumberField from './NumberField';
import styled from 'styled-components';
import { ActionType, Celery, InputType, Dispatch } from '../store/types';
import CurrencySelect from './CurrencySelect';
import { CurrencyType } from '../services/types';

interface CeleryBoxProps extends Celery {
    id: string;
    dispatch: Dispatch;
    index: number;
    rateFactor?: number;
    baseCurrency: CurrencyType;
}

const StyledTextField = styled(TextField)`
    input {
        font-size: 1.5em;
    }
`;

const usePrevious = <T extends {}>(value: T) => {
    const ref = useRef<T>();
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
};

const CeleryBox: React.FC<CeleryBoxProps> = ({
    id,
    name,
    index,
    input: { value, type, currency },
    baseCurrency,
    rateFactor,
    dispatch
}) => {
    const salary = calculateSalary(value, type, rateFactor);
    const prevSalary = usePrevious(salary);

    return (
        <Box style={{ padding: '1em' }}>
            <Grid container spacing={2}>
                <Grid item sm={4} xs={12}>
                    <StyledTextField
                        name="name"
                        placeholder={`Company ${index + 1}`}
                        color="secondary"
                        value={name}
                        style={{
                            marginBottom: 15
                        }}
                        fullWidth
                        autoFocus
                        onChange={(
                            event: React.ChangeEvent<HTMLInputElement>
                        ) => {
                            dispatch({
                                type: ActionType.SetName,
                                payload: {
                                    id,
                                    data: event.target.value
                                }
                            });
                        }}
                    />
                    <NumberField
                        name="value"
                        variant="outlined"
                        autoComplete="off"
                        // TODO: Show 'default' option to use base
                        value={value || baseCurrency}
                        onChange={(
                            event: React.ChangeEvent<HTMLInputElement>
                        ) => {
                            dispatch({
                                type: ActionType.SetInputValue,
                                payload: {
                                    id,
                                    data: event.target.value
                                }
                            });
                        }}
                        placeholder="0.00"
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <Select
                                        value={type}
                                        onChange={(
                                            e: React.ChangeEvent<{
                                                value: unknown;
                                            }>
                                        ) => {
                                            dispatch({
                                                type: ActionType.SetInputType,
                                                payload: {
                                                    id,
                                                    data: e.target.value
                                                }
                                            });
                                        }}
                                    >
                                        {Object.values(InputType).map(type => (
                                            <MenuItem key={type} value={type}>
                                                {type}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </InputAdornment>
                            )
                        }}
                    />
                    <CurrencySelect
                        value={currency || baseCurrency}
                        onChange={(
                            e: React.ChangeEvent<{
                                value: unknown;
                            }>
                        ) => {
                            dispatch({
                                type: ActionType.SetInputCurrency,
                                payload: {
                                    id,
                                    data: e.target.value
                                }
                            });
                        }}
                    />
                </Grid>
                <Grid item style={{ flex: 1 }}></Grid>
                <Grid item sm={4} xs={12}>
                    Salary:{' '}
                    <strong>
                        <CountUp
                            // Don't animate if it's already PerYear
                            start={
                                type === InputType.PerYear ? salary : prevSalary
                            }
                            end={salary}
                            prefix="$"
                            decimals={0}
                            duration={1}
                            separator=","
                        />
                    </strong>{' '}
                    / year
                    <Box>
                        <Button
                            onClick={() =>
                                dispatch({
                                    type: ActionType.RemoveCelery,
                                    payload: { id, data: null }
                                })
                            }
                        >
                            <Delete color="error" />
                        </Button>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

export default CeleryBox;
