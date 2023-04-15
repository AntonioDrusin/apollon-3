import {Box, Button, Menu, MenuItem} from "@mui/material";
import React, {useContext, useState} from "react";
import {MenuBook} from "@mui/icons-material";
import ThemeDialog from "./ThemeDialog";
import {RecordingBarContext} from "./controller/ContextProvider/Context";

export default function MainMenu() {
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [themeDialogOpen, setThemeDialogOpen] = useState(false);

    const recordingBar = useContext(RecordingBarContext);

    const handleMenuClose = () => {
        setMenuOpen(false);
    };
    const menuButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
        setMenuOpen(true);
    };

    const openThemeDialog = () => {
        setMenuOpen(false);
        setThemeDialogOpen(true);
    }
    const closeThemeDialog = () => {
        setThemeDialogOpen(false);
    }

    const switchRecordingBar = () => {
        setMenuOpen(false);
        recordingBar.setRecordingBar(true);
    }

    return <Box sx={{mx: 4}}>
        <Button
            variant="outlined"
            onClick={menuButtonClick}
        >
            <MenuBook></MenuBook>
        </Button>
        <Menu
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={() => handleMenuClose()}
        >
            <MenuItem onClick={openThemeDialog}>Themes</MenuItem>
            <MenuItem onClick={switchRecordingBar}>Show Recording</MenuItem>

        </Menu>
        <ThemeDialog open={themeDialogOpen} onClose={closeThemeDialog} ></ThemeDialog>
    </Box>
}