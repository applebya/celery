import React, { useState } from 'react';
import {
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Collapse,
    IconButton,
    InputLabel,
    FormControl,
    Typography
} from '@material-ui/core';
import {
    DeleteForever,
    ExpandLess,
    ExpandMore,
    Close,
    Settings,
    AccountBalance
} from '@material-ui/icons';
import { Dispatch, ActionType, Currencies } from '../store/types';
import styled from 'styled-components';
import { CurrencyType } from '../services/types';
import FlagImage from './FlagImage';
import NumberField from './NumberField';
import CurrencySelect from './CurrencySelect';

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
    currencies: { base, rates, date },
    min,
    desired
}) => {
    const [modalIsOpen, setResetModalIsOpen] = useState(false);
    const [currenciesIsOpen, setCurrenciesIsOpen] = useState(false);
    const [settingsIsOpen, setSettingsIsOpen] = useState(false);

    return (
        <StyledDrawer anchor="left" variant="persistent" open={isOpen}>
            <ListItem divider>
                <IconButton onClick={() => setIsOpen(false)}>
                    <Close />
                </IconButton>
                <ListItemText />
                <FormControl>
                    <InputLabel id="defaultCurrency">Currency</InputLabel>
                    <CurrencySelect
                        value={base}
                        onChange={e => {
                            dispatch({
                                type: ActionType.SetBaseCurrency,
                                payload: { data: e.target.value }
                            });
                        }}
                    />
                </FormControl>
            </ListItem>

            <ListItem>
                <ListItemText>
                    <NumberField
                        name="min"
                        label="Minimum"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            dispatch({
                                type: ActionType.SetMin,
                                payload: {
                                    data: e.target.value
                                }
                            });
                        }}
                        value={min}
                        placeholder="0.00"
                        autoFocus
                    />
                </ListItemText>
            </ListItem>

            <ListItem>
                <NumberField
                    name="desired"
                    label="Desired"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        dispatch({
                            type: ActionType.SetDesired,
                            payload: {
                                data: Number(e.target.value)
                            }
                        });
                    }}
                    value={desired}
                    placeholder="0.00"
                />
            </ListItem>

            <ListItem button onClick={() => setSettingsIsOpen(!settingsIsOpen)}>
                <ListItemIcon>
                    <Settings />
                </ListItemIcon>
                <ListItemText primary="Settings" />
                {settingsIsOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={settingsIsOpen}>
                <List
                    style={{
                        marginLeft: '1em',
                        paddingBottom: '2px'
                    }}
                >
                    <ListItem button onClick={() => setResetModalIsOpen(true)}>
                        <ListItemIcon>
                            <DeleteForever />
                        </ListItemIcon>
                        <ListItemText primary="Reset Data" />
                    </ListItem>
                    {/* TODO: More settings */}
                </List>
            </Collapse>

            <ListItem
                button
                onClick={() => setCurrenciesIsOpen(!currenciesIsOpen)}
            >
                <ListItemIcon>
                    <AccountBalance />
                </ListItemIcon>
                <ListItemText
                    primary="Exchange"
                    secondary={`($1 ${base})`}
                    secondaryTypographyProps={{
                        variant: 'caption',
                        display: 'block'
                    }}
                />
                {currenciesIsOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItem>

            <Collapse in={currenciesIsOpen}>
                <Typography align="center" variant="caption" display="block">
                    Updated: {date}
                </Typography>
                <List>
                    {Object.values(CurrencyType)
                        .filter(currency => currency !== base)
                        .map(currency => (
                            <ListItem>
                                <ListItemIcon>
                                    <FlagImage currencyCode={currency} />
                                </ListItemIcon>
                                <ListItemText
                                    primary={currency}
                                    {...(rates
                                        ? {
                                              secondary: `$${Number(
                                                  rates[currency]
                                              ).toFixed(3)}`
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
