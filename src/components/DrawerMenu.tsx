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
    Typography,
    InputAdornment,
    TextField
} from '@material-ui/core';
import {
    DeleteForever,
    ExpandLess,
    ExpandMore,
    Close,
    // Settings,
    AccountBalance,
    Star
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
    ratingTypes: {
        [x: string]: string;
    };
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
    desired,
    ratingTypes
}) => {
    const [modalIsOpen, setResetModalIsOpen] = useState(false);
    const [currenciesIsOpen, setCurrenciesIsOpen] = useState(false);
    // const [settingsIsOpen, setSettingsIsOpen] = useState(false);
    const [ratingsIsOpen, setRatingsIsOpen] = useState(false);

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
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">$</InputAdornment>
                        )
                    }}
                    value={desired}
                />
            </ListItem>

            {/* <ListItem button onClick={() => setSettingsIsOpen(!settingsIsOpen)}>
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
                </List>
            </Collapse> */}

            <ListItem button onClick={() => setRatingsIsOpen(!ratingsIsOpen)}>
                <ListItemIcon>
                    <Star />
                </ListItemIcon>
                <ListItemText primary="Ratings" />
                {ratingsIsOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={ratingsIsOpen}>
                <List
                    style={{
                        marginLeft: '1em',
                        paddingBottom: '2px'
                    }}
                >
                    {Object.entries(ratingTypes).map(
                        ([ratingID, name], index) => (
                            <ListItem key={ratingID}>
                                <TextField
                                    label={`Rating ${index + 1}`}
                                    placeholder="Enter a Rating"
                                    value={name}
                                    onChange={e => {
                                        dispatch({
                                            type: ActionType.SetRatingTypeName,
                                            payload: {
                                                id: ratingID,
                                                data: e.target.value
                                            }
                                        });
                                    }}
                                />
                            </ListItem>
                        )
                    )}
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
                    secondary={currenciesIsOpen ? `($1 ${base})` : undefined}
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
                            <ListItem key={currency}>
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

            <ListItem button onClick={() => setResetModalIsOpen(true)}>
                <ListItemIcon>
                    <DeleteForever />
                </ListItemIcon>
                <ListItemText primary="Reset Data" />
            </ListItem>

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
