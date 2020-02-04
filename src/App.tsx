import React, { useEffect, useReducer, useState } from 'react';
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
    InputAdornment,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    IconButton,
    Paper
} from '@material-ui/core';
import {
    AddCircleOutline,
    Menu,
    Settings,
    ChevronLeft
} from '@material-ui/icons';
import { ReactComponent as CeleryIcon } from './CeleryIcon.svg';
import styled from 'styled-components';

import CeleryBox from './CeleryBox';
import reducer, { initialState } from './store/reducer';
import { ActionType } from './store/types';
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

const StyledDrawer = styled(Drawer)`
    width: 200px;
`;

const App: React.FC = () => {
    const [state, dispatch] = useReducer(reducer, initialState);

    useEffect(() => {
        const restoreLatestLocalStorage = () => {
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

        window.addEventListener('focus', restoreLatestLocalStorage);

        return () =>
            window.removeEventListener('focus', restoreLatestLocalStorage);
    }, [state.timestamp, dispatch]);

    const salaries = Object.values(state.celeries).map(({ input }) =>
        calculateSalary(input.value)
    );

    const [drawerIsOpen, setDrawerIsOpen] = useState(false);

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

            <StyledDrawer
                anchor="left"
                variant="persistent"
                open={drawerIsOpen}
            >
                <div>
                    <IconButton onClick={() => setDrawerIsOpen(false)}>
                        <ChevronLeft />
                    </IconButton>
                </div>
                <List>
                    <ListItem button>
                        <ListItemIcon>
                            <Settings />
                        </ListItemIcon>
                        <ListItemText primary="Hello" />
                    </ListItem>
                </List>
            </StyledDrawer>

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
                                <Paper>
                                    <CeleryBox
                                        key={id}
                                        id={id}
                                        dispatch={dispatch}
                                        {...celery}
                                    />
                                </Paper>
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
                            Add
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
                                value={salaries}
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
                                name="min"
                                onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                ) => {
                                    dispatch({
                                        type: ActionType.SetMin,
                                        payload: {
                                            data: Number(e.target.value)
                                        }
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
                                name="max"
                                onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                ) => {
                                    dispatch({
                                        type: ActionType.SetMax,
                                        payload: {
                                            data: Number(e.target.value)
                                        }
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
