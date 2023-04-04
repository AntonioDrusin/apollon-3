import React, {useEffect, useState} from "react";
import {Box, ToggleButton, ToggleButtonGroup} from "@mui/material";
import {VisualizerInfo} from "../../../visualizers/VisualizerDirectory";
import {PlayArrow} from "@mui/icons-material";
import {ParameterLink, ParameterMap} from "../../../link/ScreenLink";
import {InputSettingsPanel} from "./InputSettingsPanel";

export interface VisualizerPanelProps {
    visualizerInfo: VisualizerInfo;
    live: boolean;
    map?: ParameterMap;
    onLive(key: string): void;
    onParameterChange(map: ParameterMap): void;
}

const sortMap = {
    "color": 1,
    "number": 0,
}

export function InputSettingsGroup({visualizerInfo, live, map, onLive, onParameterChange}: VisualizerPanelProps) {

    const [toggles, setToggles] = useState<string[]>([]);

    const handleParameterChange = (index: number, link: ParameterLink) => {
        if ( map ) {
            map.links[index] = link;
            onParameterChange(map);
        }
    };

    const handleToggles = (event: React.MouseEvent<HTMLElement>, value: any) => {
        onLive(visualizerInfo.label);
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
        {(map && visualizerInfo.inputs &&
            <Box sx={{display: "flex", flexWrap: "wrap", justifyContent: 'flex-start', flexDirection: 'row'}}>
                {
                    visualizerInfo.inputs
                        //.sort((a,b) => sortMap[a.type] - sortMap[b.type])
                        .map((info, index) => {
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
