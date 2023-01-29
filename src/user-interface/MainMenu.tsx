import {Box, IconButton, Menu, MenuItem} from "@mui/material";
import React, {useState} from "react";
import {MenuBook} from "@mui/icons-material";
import ThemeDialog from "./ThemeDialog";

export default function MainMenu() {
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [themeDialogOpen, setThemeDialogOpen] = useState(false);

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

    return <Box sx={{mx: 4}}>
        <IconButton
            onClick={menuButtonClick}
        >
            <MenuBook></MenuBook>
        </IconButton>
        <Menu
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={() => handleMenuClose()}
        >
            <MenuItem onClick={openThemeDialog}>Themes</MenuItem>
        </Menu>
        <ThemeDialog open={themeDialogOpen} onClose={closeThemeDialog} ></ThemeDialog>
    </Box>
}