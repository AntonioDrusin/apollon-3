import React, {useState} from "react";
import {
    Box,
    Card,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Slider, ToggleButton,
    ToggleButtonGroup,
    Typography
} from "@mui/material";
import {InputInfo, VisualizerInfo} from "../../visualizers/Visualizers";
import {DataSourceInfos, KeysOfNeurosityData} from "../../neurosity-adapter/NeurosityDataSource";
import {ConnectedTv, Screenshot} from "@mui/icons-material";

export interface VisualizerPanelProps {
    value: number;
    index: number;
    visualizerInfo: VisualizerInfo;
}

export function VisualizerPanel({value, index, visualizerInfo}: VisualizerPanelProps) {

    const [live,setLive] = useState(null);

    const handleLive = (event: any, newDevices: any) => {
        setLive(newDevices);
    };

    return (<div
        role="tabpanel"
        id={`simple-tabpanel-${index}`}
    >
        {value === index && (
            <Box>
                <Box sx={{p: 3}}>
                    <ToggleButtonGroup value={live} onChange={handleLive}>
                        <ToggleButton value="tv" >
                            <ConnectedTv /> <Box sx={{m:1}}>Go Live</Box>
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Box>
            <Box sx={{p: 3}}>
                {
                    visualizerInfo.inputs.map((info) => {
                        return <Card sx={{m: 1, p: 1}}>
                            <Typography key={info.label+"-typ"}>{info.label}</Typography>
                            <VisualizerInput key={info.label+"-viz"} info={info}></VisualizerInput>
                        </Card>
                    })
                }
            </Box>
            </Box>
        )}
    </div>)
}

export interface VisualizerInputProps {
    info: InputInfo;
}

function VisualizerInput({info}: VisualizerInputProps) {
    const [selectedInput, setSelectedInput] = useState<string>("Manual");

    const handleChange = (event: any) => {
        setSelectedInput(event.target.value);
    };

    return (<Box sx={{display: 'flex', flexWrap: 'wrap', p: 1, m: 1}}>
            <Box sx={{minWidth: 220}}>
                <FormControl fullWidth>
                    <InputLabel id={'input-' + info.label}>Output</InputLabel>
                    <Select value={selectedInput}
                            labelId={'input-' + info.label}
                            label="Output"
                            onChange={handleChange}
                    >
                        <MenuItem value={"Manual"}>{"<Manual>"}</MenuItem>
                        {
                            Object.keys(DataSourceInfos).map((key) => {
                                return <MenuItem value={key}>{DataSourceInfos[key as KeysOfNeurosityData].name}</MenuItem>;
                            })
                        }
                    </Select>
                </FormControl>
            </Box>
            <Slider min={info.min} max={info.max} disabled={selectedInput!=="Manual"}></Slider>
        </Box>
    );
}