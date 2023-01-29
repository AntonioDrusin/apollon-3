import {
    Backdrop,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    TextField, Typography
} from "@mui/material";
import React, {useMemo, useState} from "react";
import {Register} from "../../neurosity-adapter/Register";


interface LoginDialogProps {
    onClose?(): void;
    open: boolean;
}

export default function LoginDialog(props: LoginDialogProps) {
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loggingIn, setLoggingIn] = useState<boolean>(false);
    const neurosity = useMemo(() => Register.neurosityAdapter, []);

    const onLogin = () => {
        setLoggingIn(true);

        neurosity.logIn({email, password})
            .then(() => {
                close();
            })
            .catch((error) => {
                setError(error.message);
            })
            .finally(() => {
                setLoggingIn(false);
            });
    }

    function close() {
        props.onClose?.()
        setPassword("");
    }

    const onCancel = () => {
        close();
    }

    return (
        <Dialog open={props.open}>
            <Backdrop
                sx={{color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1}}
                open={loggingIn}
            >
                <CircularProgress color="inherit"></CircularProgress>
            </Backdrop>
            <DialogTitle>Neurosity Login</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{py: 4}}>
                    <TextField
                        id="username"
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        error={!email}
                    ></TextField>
                    <TextField
                        id="password"
                        label="Password"
                        type="password"
                        onChange={e => setPassword(e.target.value)}
                        error={!password}
                    ></TextField>
                    <Typography hidden={!error} color="secondary">{error}</Typography>
                </Stack>

            </DialogContent>
            <DialogActions>
                <Button color="secondary" onClick={onCancel}>Cancel</Button>
                <Button onClick={onLogin} disabled={!email || !password}>Login</Button>
            </DialogActions>
        </Dialog>
    );
}