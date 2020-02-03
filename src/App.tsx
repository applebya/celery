import React, { useEffect } from 'react';
import { hot } from 'react-hot-loader/root';
import {
    Button,
    AppBar,
    Toolbar,
    SvgIcon,
    Typography,
    Container,
    Grid,
    Grow,
    Slider,
    TextField,
    InputAdornment
} from '@material-ui/core';
import { AddCircleOutline, Menu } from '@material-ui/icons';
import { ReactComponent as CeleryIcon } from './CeleryIcon.svg';
import styled from 'styled-components';

import CeleryBox from './CeleryBox';
import useStore, { ActionType } from './hooks/useStore';
import calculateSalary from './calculateSalary';

const Layout = styled.div`
    height: 100vh;
    display: flex;
    flex-direction: column;
`;

const TopNav = styled(Toolbar)`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
`;

const App: React.FC = () => {
    const [state, dispatch] = useStore();

    useEffect(() => {
        const checkLocalStorage = () => {
            // TODO: Add State as type somehow?
            const persistedStore = JSON.parse(
                window.localStorage.getItem('persistedStore') || '{}'
            );

            // Override the store with persisted one if it's newer
            if (persistedStore && persistedStore.timestamp > state.timestamp) {
                dispatch({
                    type: ActionType.SetStore,
                    payload: persistedStore
                });
            }
        };

        window.addEventListener('focus', checkLocalStorage);

        return () => window.removeEventListener('focus', checkLocalStorage);
    }, [state.timestamp, dispatch]);

    return (
        <Layout>
            <AppBar position="static">
                <TopNav>
                    <Menu />
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
                    {Object.entries(state.celeries).map(([id, celery]) => (
                        <Grid item key={id}>
                            <Grow in>
                                <CeleryBox
                                    key={id}
                                    id={id}
                                    dispatch={dispatch}
                                    {...celery}
                                />
                            </Grow>
                        </Grid>
                    ))}

                    <Grid item>
                        <Button
                            size="large"
                            color="primary"
                            onClick={() =>
                                dispatch({ type: ActionType.AddCelery })
                            }
                            endIcon={<AddCircleOutline />}
                        >
                            Add celery
                        </Button>
                    </Grid>
                </Grid>

                <Grid item>
                    <Grid container spacing={2} style={{ marginTop: '3em' }}>
                        <Grid item>
                            <Typography variant="h6" color="textSecondary">
                                Min
                            </Typography>
                        </Grid>

                        <Grid item style={{ flex: 1 }}>
                            <Slider
                                color="secondary"
                                track={false}
                                min={state.min}
                                max={state.max}
                                value={Object.values(
                                    state.celeries
                                ).map(({ input }) =>
                                    calculateSalary(input.value)
                                )}
                                valueLabelFormat={(val: number) => {
                                    // TODO: 1 dec place if exists
                                    if (val >= 1000000) {
                                        return `${Math.floor(val / 1000000)}M`;
                                    } else if (val >= 1000) {
                                        return `${Math.floor(val / 1000)}K`;
                                    } else {
                                        return `$${val}`;
                                    }
                                }}
                                valueLabelDisplay="on"
                            />
                        </Grid>

                        <Grid item>
                            <Typography variant="h6" color="textSecondary">
                                Max
                            </Typography>
                        </Grid>
                    </Grid>

                    <Grid container justify="space-between">
                        <Grid item>
                            <TextField
                                name="mincelery"
                                onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                ) => {
                                    dispatch({
                                        type: ActionType.SetMin,
                                        payload: Number(e.target.value)
                                    });
                                }}
                                value={state.min}
                                placeholder="0.00"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            $
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Grid>
                        <Grid item>
                            <TextField
                                name="maxcelery"
                                onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                ) => {
                                    dispatch({
                                        type: ActionType.SetMax,
                                        payload: Number(e.target.value)
                                    });
                                }}
                                value={state.max}
                                placeholder="0.00"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            $
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Grid>
                    </Grid>
                </Grid>
            </Container>
        </Layout>
    );
};

export default process.env.NODE_ENV === 'development' ? hot(App) : App;
