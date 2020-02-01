import React, { useState } from 'react';
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
import { AddCircleOutline } from '@material-ui/icons';
import { ReactComponent as CeleryIcon } from './CeleryIcon.svg';
import styled from 'styled-components';

import SalaryBox from './SalaryBox';
import useStore, { ActionType } from './hooks/useStore';

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
    const [minSalary, setMinSalary] = useState(0);
    const [maxSalary, setMaxSalary] = useState(75000);

    return (
        <Layout>
            <AppBar position="static">
                <TopNav>
                    <div />
                    <div>
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
                    </div>
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
                    {Object.entries(state.salaries).map(([id, salary]) => (
                        <Grid item key={id}>
                            <Grow in>
                                <SalaryBox
                                    key={id}
                                    id={id}
                                    dispatch={dispatch}
                                    {...salary}
                                />
                            </Grow>
                        </Grid>
                    ))}

                    <Grid item>
                        <Button
                            size="large"
                            color="primary"
                            onClick={() =>
                                dispatch({ type: ActionType.AddSalary })
                            }
                            endIcon={<AddCircleOutline />}
                        >
                            Add Salary
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
                                min={minSalary}
                                max={maxSalary}
                                value={Object.values(state.salaries).map(
                                    ({ salary }) => salary
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
                                name="minSalary"
                                onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                ) => {
                                    setMinSalary(Number(e.target.value));
                                }}
                                value={minSalary}
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
                                name="maxSalary"
                                onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                ) => {
                                    setMaxSalary(Number(e.target.value));
                                }}
                                value={maxSalary}
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
