import React, {useEffect, useState} from "react";
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
import {ConnectedTv} from "@mui/icons-material";
import {useDrop} from "react-dnd";
import {ParameterLink, ParameterMap} from "../../link/ScreenLink";

export interface VisualizerPanelProps {
    visualizerInfo: VisualizerInfo;
    live: boolean;
    map: ParameterMap;

    onLive(key: string): void;

    onParameterChange(map: ParameterMap): void;
}

export function VisualizerPanel({visualizerInfo, live, map, onLive, onParameterChange}: VisualizerPanelProps) {

    const handleLive = () => {
        onLive(visualizerInfo.label);
    };

    const handleParameterChange = (index: number, link: ParameterLink) => {
        map.links[index] = link;
        onParameterChange(map);
    };

    const liveTv = live ? ["tv"] : [null];

    return <Box>
        <Box sx={{p: 3}}>
            <ToggleButtonGroup value={liveTv} onChange={handleLive}>
                <ToggleButton value="tv">
                    <ConnectedTv/> <Box sx={{m: 1}}>Go Live</Box>
                </ToggleButton>
            </ToggleButtonGroup>
        </Box>
        {(map &&
            <Box sx={{display: "flex", flexWrap: "wrap"}}>
                {
                    visualizerInfo.inputs.map((info, index) => {
                        return <VisualizerInput
                            key={info.label + "-viz"}
                            info={info}
                            onParameterChange={(link) => handleParameterChange(index, link)}
                            link={map.links[index]}
                        ></VisualizerInput>;
                    })
                }
            </Box>
        )}
    </Box>;
}

export interface VisualizerInputProps {
    info: InputInfo;
    link: ParameterLink;

    onParameterChange(link: ParameterLink): void;
}


function VisualizerInput({info, link, onParameterChange}: VisualizerInputProps) {
    const MANUAL = "Manual";
    const [selectedInput, setSelectedInput] = useState<string>(MANUAL);
    const [manualValue, setManualValue] = useState<number>(0);

    const [, drop] = useDrop(() => ({
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

    useEffect(() => {
        setSelectedInput(link.outputKey ?? MANUAL);
    }, [link]);

    useEffect(() => {
        let input: KeysOfNeurosityData | null;

        input = selectedInput === MANUAL
            ? null
            : selectedInput as KeysOfNeurosityData;

        onParameterChange({
            manualValue: manualValue || 0,
            outputKey: input
        })
    }, [manualValue, selectedInput, onParameterChange]);

    const handleChange = (event: any) => {
        setSelectedInput(event.target.value);
    };

    const handleManualSignalChange = (event: any) => {
        setManualValue(event.target.value);
    };

    return (
        <Card sx={{m: 1, p: 0, width: 550, outlineColor: "#232323", outlineWidth: 2, outlineStyle: "solid"}} ref={drop}>
            <Box>
                <Box sx={{background: "#232323", px: 2, py: 1}}>
                    <Typography>{info.label}</Typography>
                </Box>

                <Box sx={{display: "flex", flexWrap: "wrap", p: 1, m: 1}}>
                    <Box sx={{minWidth: 220}}>
                        <FormControl fullWidth>
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