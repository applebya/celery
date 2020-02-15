import React, { useEffect, useReducer, useState } from 'react';
import { hot } from 'react-hot-loader/root';
import {
    AppBar,
    Toolbar,
    SvgIcon,
    Typography,
    Container,
    Grid,
    Grow,
    Slider,
    Paper,
    Snackbar,
    Backdrop,
    Fab,
    Tooltip
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { Menu, Add } from '@material-ui/icons';
import { ReactComponent as CeleryIcon } from './CeleryIcon.svg';
import styled from 'styled-components';

import CeleryBox from './CeleryBox';
import reducer, { initialState } from '../store/reducer';
import { ActionType } from '../store/types';
import calculateSalary from '../utils/calculateSalary';
import DrawerMenu from './DrawerMenu';
import WizardDialog from './WizardDialog';
import formatMoney from '../utils/formatMoney';
import { fetchCurrencyRates } from '../services/fetchCurrencyRates';

const Layout = styled.div`
    height: 100vh;
    max-width: 100vw;
    display: flex;
    flex-direction: column;
`;

const TopNav = styled(Toolbar)`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
`;

const StyledSlider = styled(Slider)`
    .MuiSlider-thumb {
        transition: left 0.25s ease;
    }
    .MuiSlider-markLabel {
        text-align: center;
        max-width: 50px;
    }
`;

const StyledBackdrop = styled(Backdrop)`
    z-index: ${({ theme }) => theme.zIndex.drawer - 1};
`;

const App: React.FC = () => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const [restored, setRestored] = useState(false);
    const [drawerIsOpen, setDrawerIsOpen] = useState(false);

    useEffect(() => {
        fetchCurrencyRates(state.currencies.base, dispatch);
    }, [state.currencies.base, dispatch]);

    useEffect(() => {
        const restoreLatestLocalStorage = () => {
            // TODO: Deep-merge persistedStore into defaultState
            const persistedStore = JSON.parse(
                window.localStorage.getItem('persistedStore') || '{}'
            );

            // Override the store with persisted one if it's newer
            if (persistedStore && persistedStore.timestamp > state.timestamp) {
                setRestored(true);

                // TODO: Migrate the persisted store if schema has changed?
                dispatch({
                    type: ActionType.SetStore,
                    payload: { data: persistedStore }
                });
            }
        };

        window.addEventListener('focus', restoreLatestLocalStorage);

        return () =>
            window.removeEventListener('focus', restoreLatestLocalStorage);
    }, [state.timestamp, dispatch]);

    // TODO: Move to selector
    const salaries = Object.values(state.celeries)
        .map(
            ({
                input: { value, type, currency },
                commitment: {
                    fullTime,
                    hoursInDay,
                    daysInWeek,
                    vacationDays,
                    holidayDays
                }
            }) => {
                const defaultValues =
                    state.defaults[fullTime ? 'fullTime' : 'partTime'];

                return calculateSalary({
                    value,
                    valueType: type,
                    fullTime,
                    hoursInDay: hoursInDay || defaultValues.hoursInDay,
                    daysInWeek: daysInWeek || defaultValues.daysInWeek,
                    vacationDays: vacationDays || defaultValues.vacationDays,
                    holidayDays: holidayDays || defaultValues.holidayDays,
                    ...(state.currencies.rates
                        ? {
                              factor: (state.currencies.rates[
                                  currency || state.currencies.base
                              ] as unknown) as number
                          }
                        : {})
                });
            }
        )
        .filter(value => value > 0);

    return (
        <Layout>
            <AppBar position="static">
                <TopNav>
                    <Menu onClick={() => setDrawerIsOpen(!drawerIsOpen)} />
                    <Typography
                        variant="h6"
                        component="h1"
                        style={{
                            fontWeight: 'bold'
                        }}
                    >
                        Celery
                        <SvgIcon
                            viewBox="0 0 512 512"
                            style={{ marginLeft: 10, verticalAlign: 'sub' }}
                        >
                            <CeleryIcon />
                        </SvgIcon>
                    </Typography>
                </TopNav>
            </AppBar>

            <StyledBackdrop
                open={drawerIsOpen}
                onClick={() => setDrawerIsOpen(false)}
            />
            <DrawerMenu
                dispatch={dispatch}
                isOpen={drawerIsOpen}
                setIsOpen={setDrawerIsOpen}
                currencies={state.currencies}
                min={state.min}
                desired={state.desired}
                ratingTypes={state.ratingTypes}
            />

            <Container
                style={{
                    height: 'calc(100vh - 64px)',
                    maxHeight: 'calc(100vh - 64px)',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '3em 0 1em'
                }}
            >
                <Grid
                    container
                    direction="column"
                    spacing={2}
                    style={{ flex: 1 }}
                >
                    {Object.entries(state.celeries).map(
                        ([id, celery], index) => (
                            <Grid item key={id}>
                                <Grow in>
                                    <Paper>
                                        <CeleryBox
                                            key={id}
                                            index={index}
                                            id={id}
                                            dispatch={dispatch}
                                            // TODO: Refactor
                                            {...(state.currencies.rates
                                                ? {
                                                      rateFactor: (state
                                                          .currencies.rates[
                                                          celery.input
                                                              .currency ||
                                                              state.currencies
                                                                  .base
                                                      ] as unknown) as number
                                                  }
                                                : {})}
                                            baseCurrency={state.currencies.base}
                                            defaults={state.defaults}
                                            ratingTypes={state.ratingTypes}
                                            {...celery}
                                        />
                                    </Paper>
                                </Grow>
                            </Grid>
                        )
                    )}
                </Grid>

                <Grid item>
                    <Grid container spacing={2} style={{ marginTop: '3em' }}>
                        <Grid item>
                            <Typography variant="h6" color="textSecondary">
                                &nbsp;$&nbsp;
                            </Typography>
                        </Grid>

                        <Grid item style={{ flex: 1 }}>
                            <StyledSlider
                                color="secondary"
                                track={false}
                                min={Math.min(state.min, ...salaries)}
                                max={Math.max(state.desired, ...salaries)}
                                value={salaries}
                                valueLabelFormat={formatMoney}
                                marks={[
                                    {
                                        label: `Min. (${formatMoney(
                                            state.min
                                        )})`,
                                        value: state.min
                                    },
                                    {
                                        label: `Des. (${formatMoney(
                                            state.desired
                                        )})`,
                                        value: state.desired
                                    }
                                ]}
                                valueLabelDisplay="on"
                            />
                        </Grid>

                        <Grid item style={{ position: 'relative' }}>
                            <Tooltip
                                title="Add Opportunity"
                                placement="top"
                                arrow
                            >
                                <Fab
                                    size="large"
                                    color="primary"
                                    onClick={() =>
                                        dispatch({ type: ActionType.AddCelery })
                                    }
                                    style={{
                                        position: 'absolute',
                                        top: -75,
                                        right: 55
                                    }}
                                >
                                    <Add />
                                </Fab>
                            </Tooltip>

                            <Typography variant="h6" color="textSecondary">
                                $$$
                            </Typography>
                        </Grid>
                    </Grid>
                </Grid>
            </Container>

            <Snackbar
                open={restored}
                autoHideDuration={4000}
                onClose={() => setRestored(false)}
            >
                <Alert variant="filled" severity="success">
                    Restored from your Local Storage!
                </Alert>
            </Snackbar>

            <WizardDialog {...state} dispatch={dispatch} />
        </Layout>
    );
};

export default process.env.NODE_ENV === 'development' ? hot(App) : App;
