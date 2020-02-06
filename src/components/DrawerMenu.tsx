import React, { useState } from 'react';
import {
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Collapse
} from '@material-ui/core';
import {
    ChevronLeft,
    DeleteForever,
    ExpandLess,
    ExpandMore,
    MonetizationOn
} from '@material-ui/icons';
import { Dispatch, ActionType, Currencies } from '../store/types';
import styled from 'styled-components';
import { CurrencyType } from '../services/types';
import FlagImage from './FlagImage';
import NumberField from './NumberField';

interface DrawerMenuProps {
    dispatch: Dispatch;
    isOpen: boolean;
    setIsOpen: (a: boolean) => void;
    currencies: Currencies;
    min: number;
    desired: number;
}

const StyledDrawer = styled(Drawer)`
    min-width: 300px;
`;

const DrawerMenu: React.FC<DrawerMenuProps> = ({
    dispatch,
    isOpen,
    setIsOpen,
    currencies: { base, rates },
    min,
    desired
}) => {
    const [modalIsOpen, setResetModalIsOpen] = useState(false);
    const [currenciesIsOpen, setCurrenciesIsOpen] = useState(false);
    const [salaryIsOpen, setSalaryIsOpen] = useState(false);

    return (
        <StyledDrawer anchor="left" variant="persistent" open={isOpen}>
            <div>
                <IconButton onClick={() => setIsOpen(false)}>
                    <ChevronLeft />
                </IconButton>
            </div>

            <ListItem
                button
                onClick={() => setCurrenciesIsOpen(!currenciesIsOpen)}
            >
                <ListItemIcon>
                    <FlagImage currencyCode={base} />
                </ListItemIcon>
                <ListItemText primary={base} />
                {currenciesIsOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={currenciesIsOpen}>
                <List>
                    {Object.values(CurrencyType)
                        .filter(currency => currency !== base)
                        .map(currency => (
                            <ListItem
                                button
                                onClick={() => {
                                    dispatch({
                                        type: ActionType.SetBaseCurrency,
                                        payload: { data: currency }
                                    });
                                }}
                            >
                                <ListItemIcon>
                                    <FlagImage currencyCode={currency} />
                                </ListItemIcon>
                                <ListItemText
                                    primary={currency}
                                    {...(rates
                                        ? {
                                              secondary: Number(
                                                  rates[currency]
                                              ).toFixed(3)
                                          }
                                        : {})}
                                    secondaryTypographyProps={{
                                        variant: 'caption',
                                        style: {
                                            marginLeft: 10
                                        }
                                    }}
                                />
                            </ListItem>
                        ))}
                </List>
            </Collapse>

            <List>
                <ListItem button onClick={() => setSalaryIsOpen(!salaryIsOpen)}>
                    <ListItemIcon>
                        <MonetizationOn />
                    </ListItemIcon>
                    <ListItemText primary="Salary" />
                    {salaryIsOpen ? <ExpandLess /> : <ExpandMore />}
                </ListItem>
                <Collapse in={salaryIsOpen}>
                    <List>
                        <ListItem>
                            <ListItemText>
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
                                    value={min}
                                    placeholder="0.00"
                                    autoStretch
                                />
                            </ListItemText>
                        </ListItem>
                        <ListItem>
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
                                value={desired}
                                placeholder="0.00"
                                reversed
                                autoStretch
                            />
                        </ListItem>
                    </List>
                </Collapse>

                <ListItem button onClick={() => setResetModalIsOpen(true)}>
                    <ListItemIcon>
                        <DeleteForever />
                    </ListItemIcon>
                    <ListItemText primary="Reset Data" />
                </ListItem>
            </List>

            <Dialog open={modalIsOpen}>
                <DialogTitle>
                    <DeleteForever /> Reset Database
                </DialogTitle>
                <DialogContent dividers>
                    Are you sure you want to reset your Celery database?
                </DialogContent>
                <DialogActions>
                    <Button
                        autoFocus
                        onClick={() => setResetModalIsOpen(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            dispatch({
                                type: ActionType.ResetStore
                            });
                            setResetModalIsOpen(false);
                            setIsOpen(false);
                        }}
                        color="primary"
                    >
                        Reset
                    </Button>
                </DialogActions>
            </Dialog>
        </StyledDrawer>
    );
};

export default DrawerMenu;
