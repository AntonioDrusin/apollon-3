import React, {useContext, useEffect, useState} from "react";
import {IconButton, Snackbar} from "@mui/material";
import {Close} from "@mui/icons-material";
import {SnackBarContext} from "./ContextProvider/Context";
import {useTranslation} from "react-i18next";

export interface SnackbarMessage {
    message: string;
    key: number;
}


export default function MultiSnackBar() {
    const [snackPack, setSnackPack] = useState<readonly SnackbarMessage[]>([]);
    const [open, setOpen] = useState(false);
    const [messageInfo, setMessageInfo] = useState<SnackbarMessage | undefined>(undefined,);
    const context = useContext(SnackBarContext);
    const [t] = useTranslation();

    useEffect(() => {
        if (context.snackMessage) {
            setSnackPack((prev) => [...prev, {message: t(context.snackMessage!.text, context.snackMessage!.data), key: new Date().getTime()}]);
        }
    }, [context.snackMessage]);

    useEffect(() => {
        if (snackPack.length && !messageInfo) {
            // Set a new snack when we don't have an active one
            setMessageInfo({...snackPack[0]});
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

    return <Snackbar
        key={messageInfo ? messageInfo.key : undefined}
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        TransitionProps={{onExited: handleExited}}
        message={messageInfo ? messageInfo.message : undefined}
        action={
            <React.Fragment>
                <IconButton
                    aria-label="close"
                    color="inherit"
                    sx={{p: 0.5}}
                    onClick={handleClose}
                >
                    <Close/>
                </IconButton>
            </React.Fragment>
        }
    />
}