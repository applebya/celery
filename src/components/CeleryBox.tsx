import React, { useEffect, useRef } from 'react';
import {
    Box,
    Button,
    Grid,
    TextField,
    Select,
    MenuItem,
    InputAdornment,
    FormControlLabel,
    Switch,
    Typography
} from '@material-ui/core';
import { Delete } from '@material-ui/icons';
import CountUp from 'react-countup';
import calculateSalary from '../utils/calculateSalary';
import NumberField from './NumberField';
import styled from 'styled-components';
import {
    ActionType,
    Celery,
    InputType,
    Dispatch,
    Commitment
} from '../store/types';
import CurrencySelect from './CurrencySelect';
import { CurrencyType } from '../services/types';
import { Rating } from '@material-ui/lab';

interface CeleryBoxProps extends Celery {
    id: string;
    dispatch: Dispatch;
    index: number;
    rateFactor?: number;
    baseCurrency: CurrencyType;
    defaults: {
        fullTime: Commitment;
        partTime: Commitment;
    };
    ratings: { [x: string]: number };
    ratingTypes: { [x: string]: string };
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

const StyledSwitch = styled(Switch)`
    ${({ checked }) =>
        !checked &&
        `
            .MuiIconButton-label {
                color: #00a0ff;
            }
            .MuiSwitch-track {
                background: #00a0ff;
            }
    `}
`;

const CeleryBox: React.FC<CeleryBoxProps> = ({
    id,
    name,
    index,
    // TODO: Pass entire state, or use context/hooks
    input: { value, type, currency },
    commitment: { fullTime, hoursInDay, daysInWeek, vacationDays, holidayDays },
    ratings,
    ratingTypes,
    defaults,
    baseCurrency,
    rateFactor,
    dispatch
}) => {
    const salary = calculateSalary(value, type, rateFactor);
    const prevSalary = usePrevious(salary);
    const defaultValues = defaults[fullTime ? 'fullTime' : 'partTime'];

    return (
        <Box style={{ padding: '1em' }}>
            <Grid container spacing={3}>
                <Grid item sm={3} xs={12}>
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
                        autoComplete="off"
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
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <FormControlLabel
                                        label={
                                            fullTime ? 'Full-Time' : 'Part-Time'
                                        }
                                        control={
                                            <StyledSwitch
                                                size="small"
                                                checked={fullTime}
                                                onChange={(
                                                    e: React.ChangeEvent<
                                                        HTMLInputElement
                                                    >
                                                ) => {
                                                    dispatch({
                                                        type:
                                                            ActionType.SetCommitmentValue,
                                                        payload: {
                                                            id,
                                                            subID: 'fullTime',
                                                            data:
                                                                e.target.checked
                                                        }
                                                    });
                                                }}
                                            />
                                        }
                                    />
                                </InputAdornment>
                            )
                        }}
                    />
                    <NumberField
                        name="value"
                        variant="outlined"
                        autoComplete="off"
                        // TODO: Show 'default' option to use base
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
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    $
                                </InputAdornment>
                            ),
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
                                    <CurrencySelect
                                        value={currency || baseCurrency}
                                        onChange={(
                                            e: React.ChangeEvent<{
                                                value: unknown;
                                            }>
                                        ) => {
                                            dispatch({
                                                type:
                                                    ActionType.SetInputCurrency,
                                                payload: {
                                                    id,
                                                    data: e.target.value
                                                }
                                            });
                                        }}
                                    />
                                </InputAdornment>
                            )
                        }}
                    />
                </Grid>
                <Grid item sm={3} xs={12}>
                    <Grid container>
                        {Object.entries(ratingTypes).map(([ratingID, name]) => (
                            <Grid item md={6} sm={12} key={ratingID}>
                                <Typography
                                    component="legend"
                                    variant="caption"
                                >
                                    {name}
                                </Typography>
                                <Rating
                                    size="small"
                                    value={ratings[ratingID] || 0}
                                    precision={0.5}
                                    onChange={(
                                        e: React.ChangeEvent<{}>,
                                        value: number | null
                                    ) => {
                                        dispatch({
                                            type: ActionType.SetRating,
                                            payload: {
                                                id,
                                                subID: ratingID,
                                                data: value || 0
                                            }
                                        });
                                    }}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </Grid>
                <Grid item sm={3} xs={12}>
                    <Box>
                        <Grid container>
                            <Grid item sm={12} md={6}>
                                <NumberField
                                    label="I work:"
                                    style={{ maxWidth: 110 }}
                                    value={
                                        hoursInDay !== null
                                            ? hoursInDay
                                            : defaultValues.hoursInDay
                                    }
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                {hoursInDay === 1
                                                    ? 'hour'
                                                    : 'hours'}
                                                /day
                                            </InputAdornment>
                                        )
                                    }}
                                    onChange={(
                                        e: React.ChangeEvent<HTMLInputElement>
                                    ) => {
                                        if (Number(e.target.value) > 24) return;

                                        dispatch({
                                            type: ActionType.SetCommitmentValue,
                                            payload: {
                                                id,
                                                subID: 'hoursInDay',
                                                data: e.target.value
                                            }
                                        });
                                    }}
                                />
                            </Grid>
                            <Grid item sm={12} md={6}>
                                <NumberField
                                    label="Within:"
                                    style={{ maxWidth: 110 }}
                                    value={
                                        daysInWeek !== null
                                            ? daysInWeek
                                            : defaultValues.daysInWeek
                                    }
                                    InputProps={{
                                        max: 7,
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                {daysInWeek === 1
                                                    ? 'day'
                                                    : 'days'}
                                                /week
                                            </InputAdornment>
                                        )
                                    }}
                                    onChange={(
                                        e: React.ChangeEvent<HTMLInputElement>
                                    ) => {
                                        dispatch({
                                            type: ActionType.SetCommitmentValue,
                                            payload: {
                                                id,
                                                subID: 'daysInWeek',
                                                data: e.target.value
                                            }
                                        });
                                    }}
                                />
                            </Grid>
                        </Grid>

                        {fullTime && (
                            <Grid container>
                                <Grid item sm={12} md={6}>
                                    <NumberField
                                        label="Vacation"
                                        style={{ maxWidth: 110 }}
                                        value={
                                            vacationDays !== null
                                                ? vacationDays
                                                : defaultValues.vacationDays
                                        }
                                        InputProps={{
                                            max: 365, // TODO: Calculate remaining
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    {vacationDays === 1
                                                        ? 'day'
                                                        : 'days'}
                                                    /year
                                                </InputAdornment>
                                            )
                                        }}
                                        onChange={(
                                            e: React.ChangeEvent<
                                                HTMLInputElement
                                            >
                                        ) => {
                                            dispatch({
                                                type:
                                                    ActionType.SetCommitmentValue,
                                                payload: {
                                                    id,
                                                    subID: 'vacationDays',
                                                    data: e.target.value
                                                }
                                            });
                                        }}
                                    />
                                </Grid>
                                <Grid item sm={12} md={6}>
                                    <NumberField
                                        label="Holiday"
                                        value={
                                            holidayDays !== null
                                                ? holidayDays
                                                : defaultValues.holidayDays
                                        }
                                        style={{ maxWidth: 110 }}
                                        InputProps={{
                                            max: 365, // TODO: Calculate remaining
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    {holidayDays === 1
                                                        ? 'day'
                                                        : 'days'}
                                                    /year
                                                </InputAdornment>
                                            )
                                        }}
                                        onChange={(
                                            e: React.ChangeEvent<
                                                HTMLInputElement
                                            >
                                        ) => {
                                            dispatch({
                                                type:
                                                    ActionType.SetCommitmentValue,
                                                payload: {
                                                    id,
                                                    subID: 'holidayDays',
                                                    data: e.target.value
                                                }
                                            });
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        )}
                    </Box>
                </Grid>
                <Grid item sm={3} xs={12}>
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
