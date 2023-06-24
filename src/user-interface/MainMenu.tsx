import {Box, Button, Menu, MenuItem} from "@mui/material";
import React, {useContext, useState} from "react";
import {MenuBook} from "@mui/icons-material";
import ThemeDialog from "./ThemeDialog";
import {RecordingBarContext} from "./controller/ContextProvider/Context";
import { useTranslation } from 'react-i18next';
import LanguageDialog from "./LanguageDialog";

export default function MainMenu() {
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [themeDialogOpen, setThemeDialogOpen] = useState(false);
    const [languageDialogOpen, setLanguageDialogOpen] = useState(false);
    const { t} = useTranslation();

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

    const openLanguageDialog = () => {
        setMenuOpen(false);
        setLanguageDialogOpen(true);
    }
    const closeLanguageDialog = () => {
        setLanguageDialogOpen(false);
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
            <MenuItem onClick={switchRecordingBar}>{t('menu.items.showRecording')}</MenuItem>
            <MenuItem onClick={openThemeDialog}>{t('menu.items.themes')}</MenuItem>
            <MenuItem onClick={openLanguageDialog}>{t('menu.items.languages')}</MenuItem>

        </Menu>
        <ThemeDialog open={themeDialogOpen} onClose={closeThemeDialog} ></ThemeDialog>
        <LanguageDialog open={languageDialogOpen} onClose={closeLanguageDialog}></LanguageDialog>
    </Box>
}