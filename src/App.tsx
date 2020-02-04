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
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    IconButton,
    Paper,
    Snackbar
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
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
import { ActionType, State } from './store/types';
import calculateSalary from './calculateSalary';
import NumberField from './components/NumberField';

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
    min-width: 300px;
`;

const App: React.FC = () => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const [restored, setRestored] = useState(false);
    const [drawerIsOpen, setDrawerIsOpen] = useState(false);

    useEffect(() => {
        const restoreLatestLocalStorage = () => {
            // TODO: Add State as type somehow?
            const persistedStore = JSON.parse(
                window.localStorage.getItem('persistedStore') || '{}'
            ) as State;

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

    const salaries = Object.values(state.celeries).map(({ input }) =>
        calculateSalary(input.value)
    );

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
                            Add New
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
                            <NumberField
                                name="min"
                                onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                ) => {
                                    dispatch({
                                        type: ActionType.SetMin,
                                        payload: {
                                            data: e.target.value
                                        }
                                    });
                                }}
                                value={state.min}
                                placeholder="0.00"
                            />
                        </Grid>
                        <Grid item>
                            <NumberField
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
                            />
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
                    Restored from Local Storage!
                </Alert>
            </Snackbar>
        </Layout>
    );
};

export default process.env.NODE_ENV === 'development' ? hot(App) : App;
