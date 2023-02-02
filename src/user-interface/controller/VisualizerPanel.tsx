import React from "react";
import {Box, ToggleButton, ToggleButtonGroup} from "@mui/material";
import {VisualizerInfo} from "../../visualizers/VisualizerDirectory";
import {ConnectedTv, PlayArrow} from "@mui/icons-material";
import {ParameterLink, ParameterMap} from "../../link/ScreenLink";
import {VisualizerInput} from "./VisualizerInput";

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
                    <PlayArrow/>
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
