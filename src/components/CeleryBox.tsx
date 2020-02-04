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
import React from 'react';
import calculateSalary from '../utils/calculateSalary';
import NumberField from './NumberField';
import styled from 'styled-components';
import { Action, ActionType, Celery, InputType } from '../store/types';

interface CeleryBoxProps extends Celery {
    id: string;
    dispatch: React.Dispatch<Action>;
}

const StyledTextField = styled(TextField)`
    input {
        font-size: 1.5em;
    }
`;

const CeleryBox: React.FC<CeleryBoxProps> = ({
    id,
    name,
    input: { value, type },
    dispatch
}) => {
    const salary = calculateSalary(value, type);

    return (
        <Box style={{ padding: '1em' }}>
            <Grid container spacing={2}>
                <Grid item sm={4} xs={12}>
                    <StyledTextField
                        name="name"
                        placeholder="Untitled"
                        color="secondary"
                        value={name}
                        style={{
                            marginBottom: 15
                        }}
                        fullWidth
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
                        value={value}
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
                        autoFocus
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
                </Grid>
                <Grid item style={{ flex: 1 }}></Grid>
                <Grid item sm={4} xs={12}>
                    Salary:{' '}
                    <strong>
                        $
                        {salary
                            .toFixed(2)
                            .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
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
