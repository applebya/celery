import React, { useState, useEffect } from 'react';
import {
    Dialog,
    Button,
    DialogTitle,
    DialogContent,
    Stepper,
    Step,
    StepLabel,
    DialogActions,
    Divider,
    Typography,
    InputAdornment,
    FormLabel,
    FormGroup,
    TextField,
    Grid,
    Chip,
    Box
} from '@material-ui/core';
import { Add, Star } from '@material-ui/icons';
import uuid from 'uuid';
import styled from 'styled-components';
import { State, Dispatch, ActionType } from '../store/types';
import { initTimestamp } from '../store/reducer';
import NumberField from './NumberField';
import CurrencySelect from './CurrencySelect';

interface Props extends State {
    dispatch: Dispatch;
}

const StyledFormGroup = styled(FormGroup)`
    margin: 1.75em 0 0.5em;

    :first-of-type {
        margin-top: 0;
    }

    label {
        margin-bottom: 0.5em;
    }
`;

const StyledNumberField = styled(NumberField)`
    max-width: 150px;
`;

const Chips = styled(Box)`
    display: flex;
    flex-flow: wrap;
    margin-top: 10px;

    > * {
        margin: 8px 8px 3px 0;
    }
`;

const WizardDialog: React.FC<Props> = ({
    celeries,
    currencies,
    min,
    desired,
    ratingTypes,
    timestamp,
    dispatch
}) => {
    const [wizardIsOpen, setWizardIsOpen] = useState(
        timestamp === initTimestamp
    );

    useEffect(() => {
        if (timestamp === initTimestamp) {
            setWizardIsOpen(true);
        }
    }, [timestamp]);

    const [activeStep, setActiveStep] = useState(0);
    const [customRating, setCustomRating] = useState('');
    const isFinalStep = activeStep === 3;

    return (
        <Dialog
            open={wizardIsOpen}
            maxWidth="sm"
            onClose={() => setWizardIsOpen(false)}
            disableBackdropClick={!isFinalStep}
            disableEscapeKeyDown={!isFinalStep}
            PaperProps={{
                style: {
                    width: 500
                }
            }}
        >
            {!isFinalStep && (
                <Stepper
                    activeStep={activeStep}
                    alternativeLabel
                    // style={{ paddingBottom: 10 }}
                >
                    <Step>
                        <StepLabel>Welcome</StepLabel>
                    </Step>
                    <Step>
                        <StepLabel>My Preferences</StepLabel>
                    </Step>
                    <Step>
                        <StepLabel>Ratings</StepLabel>
                    </Step>
                </Stepper>
            )}

            <Divider />

            {activeStep === 0 && (
                <>
                    <DialogTitle style={{ textAlign: 'center' }}>
                        And so... The Hunt Begins
                    </DialogTitle>
                    <DialogContent>
                        <strong>Welcome to Celery!</strong>
                        <br />
                        <br />
                        Celery is a free/open-source tool that helps you track
                        &amp; compare job opportunities, all from 1 convenient
                        place.
                        <br />
                        <br />
                        To get started, let's learn a few details about your job
                        hunt...
                        <br />
                        <br />
                        <Typography variant="caption" style={{ width: '75%' }}>
                            <strong>Privacy Notice:</strong>
                            <br />
                            Celery stores all private data in your own browser
                            cache (on this device), and doesn't require an
                            account. No evil stuff, promise 👿
                        </Typography>
                        <br />
                        <br />
                    </DialogContent>

                    <DialogActions>
                        <Button onClick={() => setWizardIsOpen(false)}>
                            Skip Setup
                        </Button>
                        <Button
                            onClick={() => {
                                setActiveStep(1);
                            }}
                            color="primary"
                        >
                            Ok, Let's Go!
                        </Button>
                    </DialogActions>
                </>
            )}

            {activeStep === 1 && (
                <>
                    <DialogTitle style={{ textAlign: 'center' }}>
                        Cool, let's get you set up!
                    </DialogTitle>
                    <DialogContent>
                        <StyledFormGroup>
                            <FormLabel htmlFor="base">
                                First, select your base currency:
                            </FormLabel>
                            <CurrencySelect
                                id="base"
                                value={currencies.base}
                                onChange={(
                                    e: React.ChangeEvent<{ value: unknown }>
                                ) => {
                                    dispatch({
                                        type: ActionType.SetBaseCurrency,
                                        payload: { data: e.target.value }
                                    });
                                }}
                                autoFocus
                            />
                        </StyledFormGroup>

                        {/* TODO: I am seeking opportunities in different currencies */}
                        {/* TODO: What level of work commitment are you looking for? */}

                        <StyledFormGroup>
                            <FormLabel htmlFor="min">
                                What's the minimum salary you'd find acceptable?
                            </FormLabel>
                            <StyledNumberField
                                id="min"
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
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            $
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            /year
                                        </InputAdornment>
                                    )
                                }}
                                value={min}
                            />
                        </StyledFormGroup>
                        <StyledFormGroup>
                            <FormLabel htmlFor="desired">
                                And what's the salary you{' '}
                                <strong>really desire</strong>?
                            </FormLabel>
                            <StyledNumberField
                                id="desired"
                                value={desired}
                                onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                ) => {
                                    dispatch({
                                        type: ActionType.SetDesired,
                                        payload: {
                                            data: Number(e.target.value)
                                        }
                                    });
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            $
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            /year
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </StyledFormGroup>
                    </DialogContent>

                    <DialogActions>
                        <Button onClick={() => setActiveStep(0)}>Back</Button>
                        <Button
                            onClick={() => {
                                setActiveStep(2);
                            }}
                            color="primary"
                            autoFocus
                        >
                            Next
                        </Button>
                    </DialogActions>
                </>
            )}

            {activeStep === 2 && (
                <>
                    <DialogTitle style={{ textAlign: 'center' }}>
                        How do you rate job opportunities?
                    </DialogTitle>
                    <DialogContent>
                        Think about the qualities you find{' '}
                        <strong>most desireable</strong> about your next company
                        &amp; role, that you could rate out of 5 stars.
                        <br />
                        <br />
                        We've added a few suggestions to get you started.
                        <br />
                        <br />
                        <StyledFormGroup>
                            <Grid container spacing={3}>
                                <Grid item sm={7}>
                                    <TextField
                                        label="Add up to 6 custom ratings"
                                        value={customRating}
                                        onChange={e => {
                                            setCustomRating(e.target.value);
                                        }}
                                        placeholder="Ex: Work Life"
                                        fullWidth
                                        autoFocus
                                    />
                                </Grid>
                                <Grid
                                    item
                                    sm={5}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'flex-start',
                                        alignItems: 'flex-end'
                                    }}
                                >
                                    <Button
                                        endIcon={<Add />}
                                        variant="contained"
                                        color="primary"
                                        size="small"
                                        disabled={
                                            !customRating.length ||
                                            Object.entries(ratingTypes)
                                                .length >= 6
                                        }
                                        onClick={() => {
                                            dispatch({
                                                type: ActionType.AddRatingType,
                                                payload: {
                                                    id: uuid(),
                                                    data: customRating
                                                }
                                            });

                                            setCustomRating('');
                                        }}
                                    >
                                        Add
                                    </Button>
                                </Grid>
                            </Grid>

                            <Chips>
                                {Object.entries(ratingTypes).map(
                                    ([ratingID, name]) => (
                                        <Chip
                                            key={ratingID}
                                            avatar={<Star color="secondary" />}
                                            label={name}
                                            onDelete={() => {
                                                dispatch({
                                                    type:
                                                        ActionType.DeleteRatingType,
                                                    payload: {
                                                        id: ratingID
                                                    }
                                                });
                                            }}
                                        />
                                    )
                                )}
                            </Chips>
                        </StyledFormGroup>
                    </DialogContent>

                    <DialogActions>
                        <Button onClick={() => setActiveStep(1)}>Back</Button>
                        <Button
                            onClick={() => {
                                setWizardIsOpen(false);
                                // setActiveStep(3);
                            }}
                            color="primary"
                            autoFocus
                        >
                            Finish Setup
                        </Button>
                    </DialogActions>
                </>
            )}

            {/* {isFinalStep && (
                <>
                    <DialogTitle>Bingo-Bango, you're set to go!</DialogTitle>
                    <DialogContent>

                    </DialogContent>
                </>
            )} */}
        </Dialog>
    );
};

export default WizardDialog;
