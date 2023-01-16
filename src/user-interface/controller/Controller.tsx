import {
    AppBar,
    Box, Button,
    Container, IconButton, Menu, MenuItem,
    Slider, Snackbar,
    Stack,
    Toolbar,
    Typography
} from "@mui/material";
import {AccountCircle, CameraRear, PersonalVideo} from "@mui/icons-material";
import React, {useState, useEffect} from "react";
import LoginDialog from "./LoginDialog";
import {HeadsetStatus} from "./HeadsetStatus";
import {DeviceInfo} from "@neurosity/sdk/dist/cjs/types/deviceInfo";
import {NeurosityAdapter} from "../../neurosity-adapter/NeurosityAdapter";

export function controllerLoader() {
    return null;
}

export default function Controller() {
    const DISCONNECTED = "Disconnected";
    const [width, setWidth] = useState(0)
    const [dataSource, setDataSource] = useState(DISCONNECTED)
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [neurosity] = useState(() => new NeurosityAdapter());
    const [headsets, setHeadsets] = useState<DeviceInfo[]>([]);
    const [headset, setHeadset] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const devicesSub = neurosity.devices$.subscribe(setHeadsets);
        const loggedInSub = neurosity.loggedIn$.subscribe((loggedIn) => {
            setDataSource(loggedIn ? "Connected" : "Disconnected");
        })
        const deviceSub = neurosity.selectedDevice$.subscribe((device) => {
            setHeadset(device.deviceNickname);
        });

        return () => {
            devicesSub.unsubscribe();
            loggedInSub.unsubscribe();
            deviceSub.unsubscribe();
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
    const closeDialog = () => {
        setDialogOpen(false);
    };

    const openDialog = () => {
        handleMenuClose();
        setDialogOpen(true);
    };

    const logOut = () => {
        neurosity.logOut();
        handleMenuClose();
    };

    const selectDevice = (deviceId: string) => {
        neurosity.selectDevice(deviceId);
        handleMenuClose();
    }

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
                    <Box sx={{mx: 4}}>
                        <IconButton onClick={() => {window.open('/#/visualizer', '_blank');}}>
                            <PersonalVideo></PersonalVideo>
                        </IconButton>
                    </Box>
                </Toolbar>
                <Menu
                    anchorEl={anchorEl}
                    open={menuOpen}
                    onClose={() => handleMenuClose()}
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