import {Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField} from "@mui/material";
import React, {useState} from "react";


interface LoginDialogProps {
    onClose?(): void;
    open: boolean;
}

export default function LoginDialog(props: LoginDialogProps) {
    const [deviceId, setDeviceId] = useState("");

    function onLogin() {
        props.onClose?.();
    }

    return (
        <Dialog open={props.open}>
            <DialogTitle>Login</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{py: 4}}>
                    <TextField
                        id="device"
                        label="Neurosity Device ID"
                        value={deviceId}
                        onChange={(e) => setDeviceId(e.target.value)}
                    />
                </Stack>

                <Stack spacing={2} sx={{py: 4}}>
                    <TextField id="username" label="Email" type="email"></TextField>
                    <TextField id="password" label="Password" type="password"></TextField>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button color="secondary">Cancel</Button>
                <Button onClick={onLogin}>Login</Button>
            </DialogActions>
        </Dialog>
    );
}