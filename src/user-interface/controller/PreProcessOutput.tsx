import React, {useState} from "react";
import {Box, Card, FormControl, InputLabel, MenuItem, Select, TextField, Typography} from "@mui/material";
import {KeysOfNeurosityData, OutputInfo} from "../../neurosity-adapter/NeurosityDataSource";
import {MultiGraph} from "./MultiGraph";
import {NeurosityDataProcessor} from "../../neurosity-adapter/NeurosityDataProcessor";
import {MiniGraph} from "./MiniGraph";

export interface PreProcessOutputProps {
    outputInfo: OutputInfo;
    dataKey: KeysOfNeurosityData;
    processor: NeurosityDataProcessor;
}

export function PreProcessOutput({outputInfo, dataKey, processor}: PreProcessOutputProps) {
    const [clampLowString, setClampLowString] = useState<string>(outputInfo.min.toString());
    const [clampHighString, setClampHighString] = useState<string>(outputInfo.max.toString());
    const [filter, setFilter] = useState("0");

    const handleFilterChange = (event: any) => {
        setFilter(event.target.value);
        processor.getInputProcessor(dataKey).setParameters({
            firLength: parseInt(event.target.value) || 0
        })
    }

    const setClamp = (low: string, high: string) => {
        let lowClamp = parseFloat(low) || outputInfo.min;
        let highClamp = parseFloat(high) || outputInfo.max;
        processor.getInputProcessor(dataKey).setParameters({
            lowClamp,
            highClamp
        });
        console.log(`low: ${lowClamp} high: ${highClamp}`);
    }

    const handleClampLow = (event: any) => {
        const s = event.target.value
        setClampLowString(s);
        setClamp(s, clampHighString);
    }
    const handleClampHigh = (event: any) => {
        const s = event.target.value
        setClampHighString(s)
        setClamp(clampLowString, s);
    }

    return <Card sx={{m: 3, p: 0, outlineColor: outputInfo.color, outlineWidth: 2, outlineStyle: "solid"}}>
        <Box sx={{background: outputInfo.color, px: 2, py: 1}}>
            <Typography>{outputInfo.name}</Typography>
        </Box>
        <Box sx={{m: 1, p: 0}}>
            <Card sx={{m: 1, width: 240, height: 60}}>
                <MiniGraph valueId={dataKey} dataSource={processor.preData$} color={outputInfo.color} width={240}
                           height={60}></MiniGraph>
            </Card>
            <Box sx={{display: 'flex',
                flexDirection: 'row',

            }}>
                <TextField sx={{m:1}} id="clampLow" label="Low" variant="outlined" value={clampLowString}
                           onChange={handleClampLow}
                           inputProps={{inputMode: 'numeric', pattern: '[0-9\.]*'}}/>
                <TextField sx={{m:1}} id="clampHigh" label="High" variant="outlined" value={clampHighString}
                           onChange={handleClampHigh}
                           inputProps={{inputMode: 'numeric', pattern: '[0-9\.]*'}}/>
            </Box>
            <Box sx={{mr:2}}>
                <FormControl sx={{m:1}} fullWidth>
                    <InputLabel id={'input-' + dataKey}>Filtering</InputLabel>
                    <Select labelId={'input-' + dataKey} value={filter} label="Filtering" onChange={handleFilterChange}>
                        <MenuItem value={"0"}>No Filter</MenuItem>
                        <MenuItem value={"8"}>8 average</MenuItem>
                        <MenuItem value={"16"}>16 average</MenuItem>
                        <MenuItem value={"24"}>24 average</MenuItem>
                        <MenuItem value={"32"}>32 average</MenuItem>
                    </Select>
                </FormControl>
            </Box>
            <Card sx={{m: 1, width: 240, height: 60}}>
                <MultiGraph width={240} height={60}
                            key={outputInfo.name}
                            color={outputInfo.color}
                            minPlot={0}
                            maxPlot={1}
                            valueId={dataKey}
                            dataSource={processor.data$}></MultiGraph>
            </Card>
        </Box>
    </Card>
}