import {
    Box,
    Button,
    Grid,
    InputAdornment,
    TextField,
    Typography
} from '@material-ui/core';
import React from 'react';
import calculateSalary from './calculateSalary';
import styled from 'styled-components';
import { Action, ActionType, Celery } from './store/types';

type CeleryBoxProps = Celery & {
    id: string;
    dispatch: React.Dispatch<Action>;
};

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
    const salary = calculateSalary(value);

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
                    <TextField
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
                            startAdornment: (
                                <InputAdornment position="start">
                                    $
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    per hour
                                </InputAdornment>
                            )
                        }}
                    />
                </Grid>
                <Grid item style={{ flex: 1 }}></Grid>
                <Grid item sm={4} xs={12}>
                    Salary:{' '}
                    <Typography>
                        $
                        {salary
                            .toFixed(2)
                            .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                    </Typography>{' '}
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
                            Remove
                        </Button>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

export default React.memo(CeleryBox);
