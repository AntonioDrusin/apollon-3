import React, {useContext, useEffect, useMemo, useState} from "react";
import {Box, Button, Menu, MenuItem} from "@mui/material";
import {DeviceInfo} from "@neurosity/sdk/dist/cjs/types/deviceInfo";
import {Register} from "../../Register";
import LoginDialog from "./LoginDialog";
import { SnackBarContext} from "./ContextProvider/Context";


export default function ConnectionMenu() {
    const DISCONNECTED = "Disconnected";

    const [headsets, setHeadsets] = useState<DeviceInfo[]>([]);
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [dataSource, setDataSource] = useState(DISCONNECTED)
    const neurosityAdapter = useMemo(() => Register.neurosityAdapter, []);
    const [dialogOpen, setDialogOpen] = useState(false);
    const fileReader = useMemo(() => Register.neurosityFileReader, []);
    const snackContext = useContext(SnackBarContext);

    useEffect(() => {
        const devicesSub = neurosityAdapter.devices$.subscribe(setHeadsets);
        const loggedInSub = neurosityAdapter.loggedIn$.subscribe((loggedIn) => {
            setDataSource(loggedIn ? "Connected" : "Disconnected");
        })
        return () => {
            devicesSub.unsubscribe();
            loggedInSub.unsubscribe();
        };
    }, [neurosityAdapter]);

    const closeDialog = () => {
        setDialogOpen(false);
    };

    const menuButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
        setMenuOpen(true);
    };

    const handleMenuClose = () => {
        setMenuOpen(false);
    };

    const selectDevice = (deviceId: string) => {
        neurosityAdapter.selectDevice(deviceId);
        handleMenuClose();
    }
    const openDialog = () => {
        handleMenuClose();
        setDialogOpen(true);
    };

    const logOut = () => {
        neurosityAdapter.logOut();
        handleMenuClose();
    };

    const loadRecording = async () => {
        if ( await fileReader.loadFile() ) {
            snackContext.setSnackMessage("File loaded");
        }
        handleMenuClose();
    };

    return <Box>
        <Button
            variant="outlined"
            onClick={menuButtonClick}
        >{dataSource}</Button>
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
            <MenuItem onClick={loadRecording}>Load Recording</MenuItem>
            <MenuItem divider={true} disabled={true}/>
            <MenuItem onClick={openDialog}>Login</MenuItem>
            <MenuItem onClick={logOut}>Log out</MenuItem>
        </Menu>
        <LoginDialog open={dialogOpen} onClose={closeDialog}></LoginDialog>
    </Box>
}