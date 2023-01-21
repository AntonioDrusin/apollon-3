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
import {useDrop} from "react-dnd";

export interface VisualizerPanelProps {
    value: number;
    index: number;
    visualizerInfo: VisualizerInfo;
}

export function VisualizerPanel({value, index, visualizerInfo}: VisualizerPanelProps) {

    const [live, setLive] = useState(null);

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
                        <ToggleButton value="tv">
                            <ConnectedTv/> <Box sx={{m: 1}}>Go Live</Box>
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Box>
                <Box sx={{display: 'flex', flexWrap: 'wrap'}}>
                    {
                        visualizerInfo.inputs.map((info) => {
                            return <VisualizerInput key={info.label + "-viz"} info={info}></VisualizerInput>;
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

interface DropResult {
    name: string
}

function VisualizerInput({info}: VisualizerInputProps) {
    const [selectedInput, setSelectedInput] = useState<string>("Manual");
    const [{canDrop, isOver}, drop] = useDrop(() => ({
        accept: "card",
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
            what: monitor.getItem(),
        }),
        drop: (item: any, monitor: any) => {
            if (item) {
                setSelectedInput(item.key);
            }
        },
    }))

    const handleChange = (event: any) => {
        setSelectedInput(event.target.value);
    };

    return (<Card sx={{m: 1, p: 0, width: 550, outlineColor: "#232323", outlineWidth: 2, outlineStyle: "solid"}} ref={drop}>
            <Box>
                <Box sx={{background: "#232323", px: 2, py: 1}}>
                    <Typography>{info.label}</Typography>
                </Box>

                <Box sx={{display: 'flex', flexWrap: 'wrap', p: 1, m: 1}}>
                    <Box sx={{minWidth: 220}}>
                        <FormControl fullWidth>
                            <InputLabel id={'input-' + info.label}>Output</InputLabel>
                            <Select value={selectedInput}
                                    labelId={'input-' + info.label}
                                    label="Output"
                                    onChange={handleChange}
                            >
                                <MenuItem value={"Manual"} key={"manual"}>{"<Manual>"}</MenuItem>
                                {
                                    Object.keys(DataSourceInfos).map((key) => {
                                        return <MenuItem
                                            value={key}>{DataSourceInfos[key as KeysOfNeurosityData].name}</MenuItem>;
                                    })
                                }
                            </Select>
                        </FormControl>
                    </Box>
                    <Box sx={{m: 1, p: 1, width: 320}}>
                        <Slider min={info.min} max={info.max} disabled={selectedInput !== "Manual"}></Slider>
                    </Box>

                </Box>
            </Box>
        </Card>
    );
}