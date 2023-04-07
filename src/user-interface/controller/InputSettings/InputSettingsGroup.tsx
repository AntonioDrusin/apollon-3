import React, {useEffect, useState} from "react";
import {Box, ToggleButton, ToggleButtonGroup} from "@mui/material";
import {VisualizerInfo} from "../../../visualizers/VisualizerDirectory";
import {PlayArrow} from "@mui/icons-material";
import {InputSettingsPanel} from "./InputSettingsPanel";

export interface VisualizerPanelProps {
    visualizerInfo: VisualizerInfo;
    live: boolean;
    mapKey: string;
    onLive(key: string): void;
}

export function InputSettingsGroup({visualizerInfo, live, onLive, mapKey}: VisualizerPanelProps) {

    const [toggles, setToggles] = useState<string[]>([]);

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
        {(visualizerInfo.inputs &&
            <Box sx={{display: "flex", flexWrap: "wrap", justifyContent: 'flex-start', flexDirection: 'row'}}>
                {
                    visualizerInfo.inputs
                        .map((info, index) => {
                        return <InputSettingsPanel
                            key={info.label + "-viz"}
                            info={info}
                            linkIndex={index}
                            mapKey={mapKey}
                        ></InputSettingsPanel>;
                    })
                }
            </Box>
        )}
    </Box>;
}
