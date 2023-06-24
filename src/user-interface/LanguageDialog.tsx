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
import {useTranslation} from "react-i18next";
import { AllLanguages } from "./Languages";

interface LanguageDialogProps {
    onClose?(): void;
    open: boolean;
}

export default function LanguageDialog({open, onClose}: LanguageDialogProps) {
    const [t, i18n] = useTranslation();

    function close() {
        onClose?.();
    }

    const onAccept = () => {
        close();
    }

    const handleLanguageChange = (_: React.ChangeEvent<HTMLInputElement>, value: string) => {
        return i18n.changeLanguage(value);
    }

    return <Dialog open={open}>
        <DialogTitle>{t('dialog.title.language')}</DialogTitle>
        <DialogContent>
            <RadioGroup value={i18n.language} onChange={handleLanguageChange}>
                {
                    Object.keys(AllLanguages).map((language) => {
                        return <FormControlLabel key={language} value={language} control={<Radio/>} label={AllLanguages[language].name}></FormControlLabel>
                    })
                }
            </RadioGroup>
        </DialogContent>
        <DialogActions>
            <Button onClick={onAccept}>{t('dialog.close')}</Button>
        </DialogActions>
    </Dialog>
}