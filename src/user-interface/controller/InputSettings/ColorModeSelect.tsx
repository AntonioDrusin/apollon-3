import React from "react";
import {FormControl, InputLabel, MenuItem, Select} from "@mui/material";
import {colorModes, ColorModes} from "../../../link/ColorTransmission";
import { useTranslation } from "react-i18next";


interface ColorModeSelectProps {
    onChange(value: ColorModes): void;
    id: string;
    value?: string;
}

export function ColorModeSelect({id, onChange, value}: ColorModeSelectProps) {
    const {t} = useTranslation();
    const handleChange = (event: any) => {
        onChange(event.target.value)
    };

    return <FormControl fullWidth component="span">
        <InputLabel id={`${id}-input}`}>{t("inputSettings.colorMode")}</InputLabel>
        <Select value={value}
                label={t("inputSettings.colorMode")}
                labelId={`${id}-input}`}
                onChange={handleChange}
        >
            {
                Object.keys(colorModes).map((infoKey) => {
                    return <MenuItem key={`${id}-${infoKey}-item`}
                                     value={infoKey}>
                        {t(colorModes[infoKey as ColorModes].name)}
                    </MenuItem>;
                })
            }
        </Select>
    </FormControl>

}