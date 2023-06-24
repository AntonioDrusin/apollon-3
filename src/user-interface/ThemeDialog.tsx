import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    Radio,
    RadioGroup
} from "@mui/material";
import React, {useContext} from "react";
import {ThemeContext} from "../App";
import {AllThemes} from "./Themes";
import {useTranslation} from "react-i18next";

interface ThemeDialogProps {
    onClose?(): void;
    open: boolean;
}

export default function ThemeDialog({open, onClose}: ThemeDialogProps) {
    const themeContext = useContext(ThemeContext);
    const [t] = useTranslation();

    function close() {
        onClose?.();
    }

    const onAccept = () => {
        close();
    }

    const handleThemeChange = (_: React.ChangeEvent<HTMLInputElement>, value: string) => {
        themeContext.setThemeName(value);
    }

    return <Dialog open={open}>
        <DialogTitle>{t('dialog.title.theme')}</DialogTitle>
        <DialogContent>
            <RadioGroup value={themeContext.themeName} onChange={handleThemeChange}>
                {
                    Object.keys(AllThemes).map((theme) => {
                        return <FormControlLabel key={theme} value={theme} control={<Radio/>} label={t(AllThemes[theme].name)}></FormControlLabel>
                    })
                }
            </RadioGroup>
        </DialogContent>
        <DialogActions>
            <Button onClick={onAccept}>{t('dialog.close')}</Button>
        </DialogActions>
    </Dialog>
}