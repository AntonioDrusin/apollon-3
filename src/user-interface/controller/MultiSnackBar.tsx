import React, {useEffect, useState} from "react";
import {IconButton, Snackbar} from "@mui/material";
import {Close} from "@mui/icons-material";

export interface SnackbarMessage {
    message: string;
    key: number;
}

export interface MultiSnackBarProps {
    message: string | undefined;
}

export default function MultiSnackBar({message}: MultiSnackBarProps) {
    const [snackPack, setSnackPack] = useState<readonly SnackbarMessage[]>([]);
    const [open, setOpen] = useState(false);
    const [messageInfo, setMessageInfo] = useState<SnackbarMessage | undefined>(undefined,);

    useEffect(() => {
        if (message) {
            setSnackPack((prev) => [...prev, {message, key: new Date().getTime()}]);
        }
    }, [message]);

    useEffect(() => {
        if (snackPack.length && !messageInfo) {
            // Set a new snack when we don't have an active one
            setMessageInfo({ ...snackPack[0] });
            setSnackPack((prev) => prev.slice(1));
            setOpen(true);
        } else if (snackPack.length && messageInfo && open) {
            // Close an active snack when a new one is added
            setOpen(false);
        }
    }, [snackPack, messageInfo, open]);

    const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpen(false);
    };

    const handleExited = () => {
        setMessageInfo(undefined);
    };

    return<Snackbar
        key={messageInfo ? messageInfo.key : undefined}
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        TransitionProps={{ onExited: handleExited }}
        message={messageInfo ? messageInfo.message : undefined}
        action={
            <React.Fragment>
                <IconButton
                    aria-label="close"
                    color="inherit"
                    sx={{ p: 0.5 }}
                    onClick={handleClose}
                >
                    <Close/>
                </IconButton>
            </React.Fragment>
        }
    />
}