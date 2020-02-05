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
    Button
} from '@material-ui/core';
import { ChevronLeft, DeleteForever } from '@material-ui/icons';
import { Dispatch, ActionType } from '../store/types';
import styled from 'styled-components';

interface DrawerMenuProps {
    dispatch: Dispatch;
    isOpen: boolean;
    setIsOpen: (a: boolean) => void;
}

const StyledDrawer = styled(Drawer)`
    min-width: 300px;
`;

const DrawerMenu: React.FC<DrawerMenuProps> = ({
    dispatch,
    isOpen,
    setIsOpen
}) => {
    const [modalIsOpen, setResetModalIsOpen] = useState(false);

    return (
        <StyledDrawer anchor="left" variant="persistent" open={isOpen}>
            <div>
                <IconButton onClick={() => setIsOpen(false)}>
                    <ChevronLeft />
                </IconButton>
            </div>
            <List>
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
