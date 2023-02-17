import React, {useContext, useEffect, useState} from "react";
import {
    Box,
    Card,
    FormControl,
    FormControlLabel,
    InputLabel,
    MenuItem,
    Select,
    Switch,
    TextField,
    Typography
} from "@mui/material";
import {KeysOfNeurosityData, OutputInfo} from "../../../neurosity-adapter/OutputDataSource";
import {MultiGraph} from "../Graphs/MultiGraph";
import {NeurosityDataProcessor} from "../../../neurosity-adapter/NeurosityDataProcessor";
import {MiniGraph} from "../Graphs/MiniGraph";
import {getThemeByName, ThemeContext} from "../../../App";

export interface PreProcessOutputProps {
    outputInfo: OutputInfo;
    dataKey: KeysOfNeurosityData;
    processor: NeurosityDataProcessor;
}

export function PreProcessPanel({outputInfo, dataKey, processor}: PreProcessOutputProps) {
    const [clampLowString, setClampLowString] = useState<string>(outputInfo.min.toString());
    const [clampHighString, setClampHighString] = useState<string>(outputInfo.max.toString());
    const [filter, setFilter] = useState("0");
    const [loading, setLoading] = useState(true);
    const [autoscaling, setAutoscaling] = useState(true);
    const [autoscalingSeconds, setAutoscalingSeconds] = useState("0");

    const themeContext = useContext(ThemeContext);
    const theme = getThemeByName(themeContext.themeName);

    useEffect(() => {
        const inputProcessor = processor.getInputProcessor(dataKey);
        const parameters = inputProcessor.getParameters();

        setFilter(parameters.firLength?.toString() || "0");
        setClampLowString(parameters.lowClamp?.toString() || "0");
        setClampHighString(parameters.highClamp?.toString() || "1");
        setAutoscaling(parameters.autoscaling);
        setAutoscalingSeconds(parameters.autoscalingPeriodSeconds?.toString() || "1");
        setLoading(false);
    }, [processor, dataKey]);


    useEffect(() => {
        if ( !loading ) {
            let lowClamp = parseFloat(clampLowString) || outputInfo.min;
            let highClamp = parseFloat(clampHighString) || outputInfo.max;
            let autoscalingPeriodSeconds = parseFloat(autoscalingSeconds) || 1;
            let firLength = parseFloat(filter) || 0;
            processor.getInputProcessor(dataKey).setParameters({
                autoscaling,
                autoscalingPeriodSeconds,
                lowClamp,
                highClamp,
                firLength
            });
        }
    }, [loading, outputInfo, dataKey, processor, clampLowString, clampHighString, autoscaling, autoscalingSeconds, filter]);


    const handleFilterChange = (event: any) => {
        setFilter(event.target.value);
    }
    const handleClampLow = (event: any) => {
        const s = event.target.value
        setClampLowString(s);
    }

    const handleClampHigh = (event: any) => {
        const s = event.target.value
        setClampHighString(s)
    }

    const handleAutoscaling = (event: any) => {
        setAutoscaling(event.target.checked);
    }

    const handleAutoscalingSeconds = (event: any) => {
        setAutoscalingSeconds(event.target.value);
    }

    return loading ? null : (
        <Card sx={{m: 3, p: 0, outlineColor: outputInfo.color, outlineWidth: 2, outlineStyle: "solid"}}>
            <Box sx={{background: outputInfo.color, px: 2, py: 1, color: theme.palette.getContrastText(outputInfo.color)}}>
                <Typography>{outputInfo.name}</Typography>
            </Box>
            <Box sx={{m: 1, p: 0}}>
                <Card sx={{m: 1, width: 160, height: 60}}>
                    <MiniGraph valueId={dataKey} dataSource={processor.preData$} color={outputInfo.color} width={160}
                               height={60}></MiniGraph>
                </Card>
                <Box sx={{
                    display: "flex",
                    flexDirection: "column",

                }}>
                    <Box sx={{m: 2}}>
                        <FormControlLabel control={<Switch checked={autoscaling} onChange={handleAutoscaling}/>}
                                          label="Autoscaling"/>
                    </Box>

                    {autoscaling ? (
                        <Box>
                            <TextField sx={{m: 1}} id={"autoscalingSeconds-"+dataKey} label="Seconds" variant="outlined"
                                       value={autoscalingSeconds}
                                       onChange={handleAutoscalingSeconds}
                                       inputProps={{inputMode: "numeric", pattern: "[0-9.]*"}}/>
                        </Box>
                    ) : (
                        <Box sx={{
                            display: "flex",
                            flexDirection: "row",
                        }}>
                            <TextField sx={{m: 1}} id={"clampLow-"+dataKey} label="Low" variant="outlined"
                                       value={clampLowString}
                                       onChange={handleClampLow}
                                       inputProps={{inputMode: "numeric", pattern: "[0-9.]*"}}/>
                            <TextField sx={{m: 1}} id={"clampHigh-"+dataKey} label="High" variant="outlined"
                                       value={clampHighString}
                                       onChange={handleClampHigh}
                                       inputProps={{inputMode: "numeric", pattern: "[0-9.]*"}}/>
                        </Box>
                    )}
                </Box>
                <Box sx={{mr: 2}}>
                    <FormControl sx={{m: 1}} fullWidth>
                        <InputLabel id={"input-" + dataKey}>Filtering</InputLabel>
                        <Select labelId={"input-" + dataKey} value={filter} label="Filtering"
                                onChange={handleFilterChange}>
                            <MenuItem value={"0"}>No Filter</MenuItem>
                            <MenuItem value={"8"}>8 average</MenuItem>
                            <MenuItem value={"16"}>16 average</MenuItem>
                            <MenuItem value={"24"}>24 average</MenuItem>
                            <MenuItem value={"32"}>32 average</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
                <Card sx={{m: 1, width: 160, height: 60}}>
                    <MultiGraph width={160} height={60}
                                key={outputInfo.name}
                                color={outputInfo.color}
                                minPlot={0}
                                maxPlot={1}
                                valueId={dataKey}
                                dataSource={processor.data$}></MultiGraph>
                </Card>
            </Box>
        </Card>)
        ;
}