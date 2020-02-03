import React from 'react';
import {
    TextField,
    InputAdornment,
    Grid,
    Paper,
    Button,
    Box,
    Typography
} from '@material-ui/core';
import { Action, ActionType, Celery } from './hooks/useStore';
import calculateSalary from './calculateSalary';

type CeleryBoxProps = Celery & {
    id: string;
    dispatch: (action: Action) => void;
};

const CeleryBox: React.FunctionComponent<CeleryBoxProps> = ({
    id,
    name,
    input: { value, type, mask },
    dispatch,
    ...props
}) => {
    const salary = calculateSalary(value);

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

export default React.memo(CeleryBox);
