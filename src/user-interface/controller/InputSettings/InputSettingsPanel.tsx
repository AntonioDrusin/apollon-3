import React, {useContext} from "react";
import {getThemeByName, ThemeContext} from "../../../App";
import {Box, Card, Typography} from "@mui/material";
import {InputInfo} from "../../../visualizers/VisualizerDirectory";
import {NumberSettings} from "./NumberSettings";
import { ColorSettings } from "./ColorSettings";
import {BooleanSettings} from "./BooleanSettings";
import {ImageSettings} from "./ImageSettings";
import {useTranslation} from "react-i18next";

export interface VisualizerInputProps {
    info: InputInfo;
    linkIndex: number;
    mapKey: string;
}

export function InputSettingsPanel({info, linkIndex, mapKey}: VisualizerInputProps) {
    const themeContext = useContext(ThemeContext);
    const theme = getThemeByName(themeContext.themeName);

    const Settings = (type: string) => {
        switch(info.type) {
            case "number":
                return <NumberSettings linkIndex={linkIndex} mapKey={mapKey}/>
            case "color":
                return <ColorSettings linkIndex={linkIndex} mapKey={mapKey} info={info}/>
            case "boolean":
                return <BooleanSettings linkIndex={linkIndex} mapKey={mapKey} info={info}/>
            case "image":
                return <ImageSettings linkIndex={linkIndex} mapKey={mapKey}/>
            default:
                return <Box>Not implemented</Box>
        }
    }

    const {t} = useTranslation();
    return <Card sx={{m: 1, p: 0,
            outlineColor: theme.palette.primary.dark,
            outlineWidth: 2, outlineStyle: "solid",
            width: 340, height: '100%'}}>
            <Box sx={{px: 2, py: 1, backgroundColor: theme.palette.primary.dark, color: theme.palette.getContrastText(theme.palette.primary.dark)}}>
                <Typography>{t(info.label)}</Typography>
            </Box>
            <Box>
                {Settings(info.type)}
            </Box>
        </Card>;
}