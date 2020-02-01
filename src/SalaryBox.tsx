import React from 'react';
import {
    TextField,
    InputAdornment,
    Grid,
    Paper,
    Button,
    Box
} from '@material-ui/core';
import { Action, ActionType } from './hooks/useStore';
import { calculateSalary } from './utils';

interface SalaryBoxProps {
    id: string;
    name: string;
    hourlyRate: string;
    dispatch: (action: Action) => void;
}

const SalaryBox: React.FunctionComponent<SalaryBoxProps> = ({
    id,
    name,
    hourlyRate,
    dispatch,
    ...props
}) => {
    return (
        <Paper {...props}>
            <Box style={{ padding: '1em' }}>
                <Grid container spacing={2}>
                    <Grid item sm={4} xs={12}>
                        <TextField
                            name="name"
                            placeholder="Untitled"
                            color="secondary"
                            value={name}
                            style={{
                                marginBottom: 15
                            }}
                            inputProps={{ style: { fontSize: '1.5em' } }}
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
                            name="hourlyRate"
                            variant="outlined"
                            autoComplete="off"
                            value={hourlyRate}
                            onChange={(
                                event: React.ChangeEvent<HTMLInputElement>
                            ) => {
                                dispatch({
                                    type: ActionType.SetHourlyRate,
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
                        <strong>
                            $
                            {calculateSalary(Number(hourlyRate))
                                .toFixed(2)
                                .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                        </strong>{' '}
                        / year
                        <Box>
                            <Button
                                onClick={() =>
                                    dispatch({
                                        type: ActionType.RemoveSalary,
                                        payload: {
                                            id
                                        }
                                    })
                                }
                            >
                                Remove
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </Paper>
    );
};

export default React.memo(SalaryBox);
