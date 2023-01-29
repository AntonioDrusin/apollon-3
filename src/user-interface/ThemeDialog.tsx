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

interface ThemeDialogProps {
    onClose?(): void;
    open: boolean;
}

export default function ThemeDialog({open, onClose}: ThemeDialogProps) {
    const themeContext = useContext(ThemeContext);

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
        <DialogTitle>Select your theme</DialogTitle>
        <DialogContent>
            <RadioGroup value={themeContext.themeName} onChange={handleThemeChange}>
                {
                    Object.keys(AllThemes).map((t) => {
                        return <FormControlLabel key={t} value={t} control={<Radio/>} label={AllThemes[t].name}></FormControlLabel>
                    })
                }
            </RadioGroup>
        </DialogContent>
        <DialogActions>
            <Button onClick={onAccept}>Close</Button>
        </DialogActions>
    </Dialog>
}