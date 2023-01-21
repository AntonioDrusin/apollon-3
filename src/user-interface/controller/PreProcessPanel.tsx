import React, {useState} from "react";
import {Box, Card, FormControl, InputLabel, MenuItem, Select, Slider, Typography} from "@mui/material";
import {DataSourceInfos, KeysOfNeurosityData, OutputInfo} from "../../neurosity-adapter/NeurosityDataSource";

export interface PreProcessPanelProps {
    value: number;
    index: number;
}


export function PreProcessPanel({index, value}: PreProcessPanelProps) {

    return <div
        role="tabpanel"
        id={`simple-tabpanel-${index}`}
    >
        {value === index && (
            <Box sx={{display: 'flex', flexWrap: 'wrap'}}>
                {
                    Object.keys(DataSourceInfos).map((key) => {
                        return <Box sx={{width:320}} key={key}>
                            <PreProcessOutput index={key} outputInfo={DataSourceInfos[key as KeysOfNeurosityData]}></PreProcessOutput>
                        </Box>;
                    })
                }
            </Box>
        )}
    </div>
}

export interface PreProcessOutputProps{
    outputInfo: OutputInfo;
    index: string;
}
export function PreProcessOutput({outputInfo, index}: PreProcessOutputProps) {
    const [values, setValues] = useState([outputInfo.min,outputInfo.max]);
    const [filter, setFilter] = useState("");

    const handleClampSlider = (event: Event, newValue: number | number[]) => {
        setValues(newValue as number[]);
    };

    const handleFilterChange = (event: any) =>{
        setFilter(event.target.value);
    }

    return <Card sx={{m: 3, p: 0, outlineColor: outputInfo.color, outlineWidth: 2, outlineStyle: "solid"}}>
        <Box sx={{background: outputInfo.color, px: 2, py: 1}}>
            <Typography >{outputInfo.name}</Typography>
        </Box>

        <Box sx={{m:1, p:1}}>
            <Slider step={(outputInfo.max-outputInfo.min)/2000} min={outputInfo.min} max={outputInfo.max} value={values} onChange={handleClampSlider} valueLabelDisplay="auto"></Slider>
            <Box>
            <FormControl fullWidth>
                <InputLabel id={'input-' + index}>Filtering</InputLabel>
                <Select labelId={'input-'+index} value={filter} label="Filtering" onChange={handleFilterChange}>
                    <MenuItem value={"0"}>No Filter</MenuItem>
                    <MenuItem value={"8"}>8 average</MenuItem>
                    <MenuItem value={"16"}>16 average</MenuItem>
                </Select>
            </FormControl>
            </Box>

        </Box>
    </Card>
}