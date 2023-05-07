import React, {useContext, useEffect, useState} from "react";
import {Box, Button, ToggleButton, ToggleButtonGroup} from "@mui/material";
import {VisualizerInfo} from "../../../visualizers/VisualizerDirectory";
import {FileDownload, FileUpload, PlayArrow} from "@mui/icons-material";
import {InputSettingsPanel} from "./InputSettingsPanel";
import {Register} from "../../../Register";
import {SnackBarContext} from "../ContextProvider/Context";

export interface VisualizerPanelProps {
    visualizerInfo: VisualizerInfo;
    live: boolean;
    mapKey: string;
    onLive(key: string): void;
}

export function InputSettingsGroup({visualizerInfo, live, onLive, mapKey}: VisualizerPanelProps) {

    const [toggles, setToggles] = useState<string[]>([]);
    const [store] = useState(Register.outputMapStore);
    const snackContext = useContext(SnackBarContext);

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

    const handleDownload = async () => {
        await store.saveVisualizerSettings(mapKey);
    };

    const handleUpload = async () => {
        const error = await store.loadVisualizerSettings(mapKey);
        if ( error ) {
            snackContext.setSnackMessage(error);
        }
    };


    return <Box>
        <Box sx={{p: 3, display: "flex", flexDirection: "row", alignItems: "center"}}>
            <ToggleButtonGroup value={toggles} onChange={handleToggles}>
                <ToggleButton value="tv">
                    <PlayArrow/>
                </ToggleButton>
            </ToggleButtonGroup>
            <Box sx={{flexGrow: 1}}></Box>
            <Button variant={"outlined"} onClick={handleDownload}>
                <FileDownload/> Download Parameters
            </Button>
            <Button variant={"outlined"} onClick={handleUpload}>
                <FileUpload/> Upload Parameters
            </Button>
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
