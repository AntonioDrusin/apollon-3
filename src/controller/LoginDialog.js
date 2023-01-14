import {Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField} from "@mui/material";
import React, {useState} from "react";

export default function LoginDialog(props) {
    const [deviceId, setDeviceId] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    function onLogin() {
        if ( props.onClose) props.onClose();
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