import {
    AppBar,
    Box, Button,
    Container, Menu, MenuItem,
    Slider, Snackbar,
    Stack,
    Toolbar,
    Typography
} from "@mui/material";
import {CameraRear} from "@mui/icons-material";
import React, {useState, useEffect} from "react";
import LoginDialog, {LoginDialogResult} from "./LoginDialog";
import {Neurosity} from "@neurosity/sdk";
import {HeadsetStatus} from "./HeadsetStatus";
import {DeviceInfo} from "@neurosity/sdk/dist/cjs/types/deviceInfo";
import { Subscription } from "rxjs";

export function controllerLoader() {
    return null;
}

export default function Controller() {
    const DISCONNECTED = "Disconnected";
    const [width, setWidth] = useState(0)
    const [dataSource, setDataSource] = useState(DISCONNECTED)
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [neurosity, setNeurosity] = useState(() => new Neurosity({autoSelectDevice: false}));
    const [headsets, setHeadsets] = useState<DeviceInfo[]>([]);
    const [headset, setHeadset] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    let brainwavesSubscription: Subscription | null = null;

    useEffect(() => {
        if (!neurosity) {
            return;
        }
        const subscription = neurosity.onAuthStateChanged().subscribe((user) => {
            if (user) {
                setDataSource("Logged In");
                neurosity.getDevices().then((devices) => {
                    setHeadsets(devices);
                });
                reconnect();
            } else {
                setDataSource("Disconnected");
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [neurosity]);


    const menuButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
        setMenuOpen(true);
    };
    const handleMenuClose = () => {
        setMenuOpen(false);
    };

    const [dialogOpen, setDialogOpen] = React.useState(false);
    const closeDialog = (result: LoginDialogResult) => {
        setDialogOpen(false);
    };

    const openDialog = () => {
        handleMenuClose();
        setDialogOpen(true);
    };

    const logOut = () => {
        neurosity.logout().then(() => {
            resetState();
            setNeurosity(new Neurosity({autoSelectDevice: false}));
        });
        setHeadsets([]);
        handleMenuClose();
    };

    const reconnect = () => {
        brainwavesSubscription?.unsubscribe();
        brainwavesSubscription = neurosity.brainwaves("raw").subscribe((brainwaves) => {
            console.log(brainwaves);
        });
    };

    const selectDevice = (deviceId: string) => {
        return neurosity
            .selectDevice((devices) =>
                devices.find((device) => device.deviceId === deviceId) ||
                devices[0]
            )
            .then((device) => {
                setHeadset(device.deviceNickname);
                handleMenuClose();
                reconnect();
            })
            .catch((error) => setError(error));
    }

    const resetState = () => {
        // Maybe disconnect some stuff?
        setHeadset(null);
        setHeadsets([]);
        setError("Disconnected");
    };

    const errorClose = () => {
        setError(null);
    };

    const widthChange = (event: Event, newValue: number | number[]) => {
        setWidth(newValue as number);
    };

    useEffect(() => {
        const value = {
            width: width,
        };
        localStorage.setItem('controls', JSON.stringify(value));
    });

    return (
        <Box>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
                        Apollon 3
                    </Typography>
                    <Box sx={{mx: 4}}>
                        <HeadsetStatus neurosity={neurosity} headset={headset}></HeadsetStatus>
                    </Box>
                    <Button
                        variant="outlined"
                        onClick={menuButtonClick}
                    >{dataSource}</Button>
                </Toolbar>
                <Menu
                    anchorEl={anchorEl}
                    open={menuOpen}
                    onClose={handleMenuClose}
                >
                    {
                        headsets.map((headset) => {
                            return <MenuItem key={headset.deviceId}
                                             onClick={() => selectDevice(headset.deviceId)}>{headset.deviceNickname}</MenuItem>;
                        })
                    }
                    <MenuItem divider={true} hidden={!headsets || headsets.length === 0} disabled={true}/>
                    <MenuItem onClick={openDialog}>Login</MenuItem>
                    <MenuItem onClick={logOut}>Log out</MenuItem>
                </Menu>

                <LoginDialog open={dialogOpen} onClose={closeDialog} neurosity={neurosity}></LoginDialog>


            </AppBar>
            <Container maxWidth="lg">
                <Box sx={{my: 4}}>
                    <Typography component="h1" variant="h4" gutterBottom>
                        Controller
                    </Typography>
                    <Box sx={{px: 4}}>
                        <Stack spacing={2} direction="row" sx={{mb: 1}} alignItems="center">
                            <CameraRear/>
                            <Slider aria-label="Volume" value={width} onChange={widthChange}/>
                        </Stack>
                    </Box>
                </Box>
            </Container>
            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={errorClose}
                message={error}
            />
        </Box>
    );
}