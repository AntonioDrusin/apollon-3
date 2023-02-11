import React, {useContext, useEffect, useState} from "react";
import {useDrop} from "react-dnd";
import {DataSourceInfos, KeysOfNeurosityData} from "../../../neurosity-adapter/OutputDataSource";
import {getThemeByName, ThemeContext} from "../../../App";
import {Box, Card, FormControl, InputLabel, MenuItem, Select, Slider, Typography} from "@mui/material";
import {InputInfo} from "../../../visualizers/VisualizerDirectory";
import {ParameterLink} from "../../../link/ScreenLink";

export interface VisualizerInputProps {
    info: InputInfo;
    link: ParameterLink;

    onParameterChange(link: ParameterLink): void;
}


export function InputSettingsPanel({info, link, onParameterChange}: VisualizerInputProps) {
    const MANUAL = "Manual";
    const [selectedInput, setSelectedInput] = useState<string>(MANUAL);
    const [manualValue, setManualValue] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const themeContext = useContext(ThemeContext);
    const theme = getThemeByName(themeContext.themeName);


    const [, drop] = useDrop(() => ({
        accept: "card",
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
            what: monitor.getItem(),
        }),
        drop: (item: any) => {
            if (item) {
                setSelectedInput(item.key);
            }
        },
    }))

    useEffect(() => {
        setSelectedInput(link.outputKey ?? MANUAL);
        setLoading(false);
    }, [link]);

    useEffect(() => {
        if ( !loading ) {
            let input: KeysOfNeurosityData | null;

            input = selectedInput === MANUAL
                ? null
                : selectedInput as KeysOfNeurosityData;

            onParameterChange({
                manualValue: manualValue || 0,
                outputKey: input
            })
        }
    }, [loading, manualValue, selectedInput, onParameterChange]);

    const handleChange = (event: any) => {
        setSelectedInput(event.target.value);
    };

    const handleManualSignalChange = (event: any) => {
        setManualValue(event.target.value);
    };

    return loading ? null : (
        <Card sx={{m: 3, p: 0,
            outlineColor: theme.palette.primary.dark,
            outlineWidth: 2, outlineStyle: "solid",
            width: 340}} ref={drop}>
            <Box sx={{px: 2, py: 1, backgroundColor: theme.palette.primary.dark}}>
                <Typography>{info.label}</Typography>
            </Box>
            <Box>

                <Box sx={{display: "flex", flexWrap: "wrap", p: 1, m: 1}}>
                    <Box
                        sx={{
                            width: 54, height: 54, mx: 1, p: 1,
                            borderRadius: 27,
                            backgroundColor: DataSourceInfos[selectedInput as KeysOfNeurosityData]?.color ?? theme.palette.background.default
                        }}>
                    </Box>
                    <Box sx={{minWidth: 220}}>
                        <FormControl fullWidth component="span">
                            <InputLabel id={"input-" + info.label}>Output</InputLabel>
                            <Select value={selectedInput}
                                    labelId={"input-" + info.label}
                                    label="Output"
                                    onChange={handleChange}
                            >
                                <MenuItem value={MANUAL} key={MANUAL + "-key"}>{"<Manual>"}</MenuItem>
                                {
                                    Object.keys(DataSourceInfos).map((key) => {
                                        return <MenuItem key={key + "-key"}
                                                         value={key}>
                                            {DataSourceInfos[key as KeysOfNeurosityData].name}
                                        </MenuItem>;
                                    })
                                }
                            </Select>
                        </FormControl>
                    </Box>
                    <Box sx={{m: 1, p: 1, width: 320}}>
                        <Slider value={manualValue} onChange={handleManualSignalChange} step={0.01} min={0} max={1.0}
                                disabled={selectedInput !== MANUAL}></Slider>
                    </Box>
                </Box>
            </Box>
        </Card>
    );
}