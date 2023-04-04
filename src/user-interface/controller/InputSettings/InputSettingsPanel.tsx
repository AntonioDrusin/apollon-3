import React, {useContext, useEffect, useState} from "react";
import {getThemeByName, ThemeContext} from "../../../App";
import {Box, Card, Typography} from "@mui/material";
import {InputInfo} from "../../../visualizers/VisualizerDirectory";
import {ParameterLink} from "../../../link/ScreenLink";
import {NumberSettings} from "./NumberSettings";
import { ColorSettings } from "./ColorSettings";

export interface VisualizerInputProps {
    info: InputInfo;
    link: ParameterLink;
    onParameterChange(link: ParameterLink): void;
}

export function InputSettingsPanel({info, link, onParameterChange}: VisualizerInputProps) {
    const themeContext = useContext(ThemeContext);
    const theme = getThemeByName(themeContext.themeName);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if ( link ) {
            setLoading(false);
        }
    }, [link]);

    return loading ? null : (
        <Card sx={{m: 1, p: 0,
            outlineColor: theme.palette.primary.dark,
            outlineWidth: 2, outlineStyle: "solid",
            width: 340, height: '100%'}}>
            <Box sx={{px: 2, py: 1, backgroundColor: theme.palette.primary.dark, color: theme.palette.getContrastText(theme.palette.primary.dark)}}>
                <Typography>{info.label}</Typography>
            </Box>
            <Box>
                { info.type === "number" ?
                    <NumberSettings onParameterChange={(link) => onParameterChange(link)} link={link} info={info}/> :
                    <ColorSettings onParameterChange={(link) => onParameterChange(link)} link={link} info={info}/>
                }
            </Box>
        </Card>
    );
}