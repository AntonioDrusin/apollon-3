import {
    AppBar,
    Box, Button,
    Container, Menu, MenuItem,
    Slider,
    Stack,
    Toolbar,
    Typography
} from "@mui/material";
import {CameraRear} from "@mui/icons-material";
import React, {useState, useEffect} from "react";
import {ControllerContext} from "./ControllerContext"
import LoginDialog from "./LoginDialog";

export function controllerLoader() {
    return null;
}

export default function Controller() {
    const [width, setWidth] = useState(0)
    const [context] = useState({authenticated: false});

    const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
    const open = !!anchorEl;
    const menuButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const [dialogOpen, setDialogOpen] = React.useState(false);
    const closeDialog = () => {
        setDialogOpen(false);
    };
    const openDialog = () => {
        handleClose();
        setDialogOpen(true);
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
        <AppBar position="static">
            <ControllerContext.Provider value={context}>
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
                        Apollon 3
                    </Typography>
                    <Button
                        variant="outlined"
                        onClick={menuButtonClick}
                    >Disconnected</Button>
                </Toolbar>

                <Menu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                >
                    <MenuItem onClick={openDialog}>Login to Neurosity</MenuItem>
                </Menu>

                <LoginDialog open={dialogOpen} onClose={closeDialog}></LoginDialog>

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
            </ControllerContext.Provider>
        </AppBar>
    );
}