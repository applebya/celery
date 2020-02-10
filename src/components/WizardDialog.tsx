import React, { useState } from 'react';
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
    InputAdornment
} from '@material-ui/core';
import { State, Dispatch, ActionType } from '../store/types';
import NumberField from './NumberField';

interface Props extends State {
    dispatch: Dispatch;
}

const WizardDialog: React.FunctionComponent<Props> = ({
    celeries,
    min,
    desired,
    dispatch
}) => {
    const [wizardIsOpen, setWizardIsOpen] = useState(!celeries.length);
    const [activeStep, setActiveStep] = useState(0);

    return (
        <Dialog
            open={wizardIsOpen}
            maxWidth="xs"
            onClose={() => setWizardIsOpen(false)}
            disableBackdropClick
            disableEscapeKeyDown
        >
            <Stepper
                activeStep={activeStep}
                alternativeLabel
                // style={{ paddingBottom: 10 }}
            >
                <Step>
                    <StepLabel>Welcome!</StepLabel>
                </Step>
                <Step>
                    <StepLabel>Money</StepLabel>
                </Step>
                <Step>
                    <StepLabel>Ratings</StepLabel>
                </Step>
            </Stepper>

            <Divider />

            {activeStep === 0 && (
                <>
                    <DialogTitle style={{ textAlign: 'center' }}>
                        Welcome to Celery!
                    </DialogTitle>
                    <DialogContent>
                        Your personal job hunt tool, helping you{' '}
                        <strong>track</strong> and <strong>compare</strong>{' '}
                        various job opportunities.
                        <br />
                        <br />
                        <em>
                            (like an Excel spreadsheet... but a bit prettier!)
                        </em>
                        <br />
                        <br />
                        Before we start adding companies, let's learn a few
                        basic details about your job-hunt...
                        <br />
                        <br />
                        <Typography variant="caption">
                            <strong>Privacy Note:</strong> Celery doesn't
                            collect your personal data, or require creating an
                            account. Your data is saved to this browser (on this
                            device only) and available to you offline.
                        </Typography>
                    </DialogContent>

                    <DialogActions>
                        <Button onClick={() => setWizardIsOpen(false)}>
                            Skip Wizard
                        </Button>
                        <Button
                            onClick={() => {
                                setActiveStep(1);
                            }}
                            color="primary"
                            autoFocus
                        >
                            Ok, Let's Go!
                        </Button>
                    </DialogActions>
                </>
            )}

            {activeStep === 1 && (
                <>
                    <DialogContent>
                        Home Currency:
                        {/* I am seeking opportunities in different currencies */}
                        {/* What level of work commitment are you looking for? */}
                        What's the minimum salary you're looking to earn in a
                        year?
                        <NumberField
                            name="min"
                            label="Minimum"
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
                                )
                            }}
                            value={min}
                            autoFocus
                        />
                        And what's the salary you <strong>really desire</strong>
                        ?
                        <NumberField
                            name="desired"
                            label="Desired"
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
                                )
                            }}
                            value={desired}
                        />
                    </DialogContent>

                    <DialogActions>
                        <Button onClick={() => setActiveStep(0)}>Back</Button>
                        <Button
                            onClick={() => {
                                setActiveStep(1);
                            }}
                            color="primary"
                            autoFocus
                        >
                            Next
                        </Button>
                    </DialogActions>
                </>
            )}
        </Dialog>
    );
};

export default WizardDialog;
