import React, {useEffect, useState} from "react";
import {Box, ToggleButton, ToggleButtonGroup} from "@mui/material";
import {VisualizerInfo} from "../../../visualizers/VisualizerDirectory";
import {PlayArrow} from "@mui/icons-material";
import {ParameterLink, ParameterMap} from "../../../link/ScreenLink";
import {InputSettingsPanel} from "./InputSettingsPanel";

export interface VisualizerPanelProps {
    visualizerInfo: VisualizerInfo;
    live: boolean;
    map: ParameterMap;
    onLive(key: string): void;
    onParameterChange(map: ParameterMap): void;
}


export function InputSettingsGroup({visualizerInfo, live, map, onLive, onParameterChange}: VisualizerPanelProps) {

    const [toggles, setToggles] = useState<string[]>([]);

    const handleParameterChange = (index: number, link: ParameterLink) => {
        map.links[index] = link;
        onParameterChange(map);
    };

    const handleToggles = (event: React.MouseEvent<HTMLElement>, value: any) => {
        if (value.indexOf("tv") !== -1) {
            onLive(visualizerInfo.label);
        }
    };


    useEffect(() => {
        const toggle = (item: string, state: boolean): void => {
            const index = toggles.indexOf(item);
            if ( state ){
                if (index === -1) {
                    setToggles(toggles.concat([item]));
                }

            }
            else {
                if (index !== -1) {
                    setToggles(toggles.filter( i => i !== item));
                }
            }
        }

        toggle("tv", live);
    }, [
        toggles,
        live
    ]);


    return <Box>
        <Box sx={{p: 3}}>
            <ToggleButtonGroup value={toggles} onChange={handleToggles}>
                <ToggleButton value="tv">
                    <PlayArrow/>
                </ToggleButton>
            </ToggleButtonGroup>
        </Box>
        {(map &&
            <Box sx={{display: "flex", flexWrap: "wrap"}}>
                {
                    visualizerInfo.inputs.map((info, index) => {
                        return <InputSettingsPanel
                            key={info.label + "-viz"}
                            info={info}
                            onParameterChange={(link) => handleParameterChange(index, link)}
                            link={map.links[index]}
                        ></InputSettingsPanel>;
                    })
                }
            </Box>
        )}
    </Box>;
}
