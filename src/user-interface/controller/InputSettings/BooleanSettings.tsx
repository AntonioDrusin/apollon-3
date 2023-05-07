import {Box, Switch, Slider, Typography} from "@mui/material";
import React, {useEffect, useState} from "react";
import {InputInfo} from "../../../visualizers/VisualizerDirectory";
import {NumberSettingsProps} from "./NumberSettings";
import {Register} from "../../../Register";
import {BooleanLink} from "../../../link/ScreenLink";
import {OutputSourceSelect} from "./OutputSourceSelect";
import {KeysOfNeurosityData} from "../../../neurosity-adapter/OutputDataSource";
import * as _ from "lodash";

export interface BooleanSettingsProps {
    info: InputInfo;
    linkIndex: number;
    mapKey: string
}

export function BooleanSettings({info, linkIndex, mapKey}: NumberSettingsProps) {
    const [store] = useState(Register.outputMapStore);
    const [link, setLink] = useState<BooleanLink>();

    useEffect(() => {
        const sub = store.parameterMap$
            .subscribe((parameters) => {
                const parameter = parameters[mapKey];
                if (parameter) {
                    const newLink = parameter.links[linkIndex];
                    if (newLink && newLink.type === "boolean" && !_.isEqual(newLink.booleanLink, link)) {
                        setLink({...newLink.booleanLink!});
                    }
                }
            });

        return () => {
            sub.unsubscribe();
        }
    }, [link, store, linkIndex, mapKey]);

    const updateLink = (newLink: BooleanLink) => {
        store.setParameterLink(mapKey, linkIndex, newLink);
    }

    // REFACTOR
    const handleSelectedInputChange = (value: string) => {
        updateLink({...link!, outputKey: value as KeysOfNeurosityData | undefined});
    }

    const handleThresholdChange = (event: any) => {
        updateLink({...link!, threshold: event.target.value});
    }

    const handleManualValueChange = (event: any) => {
        updateLink({...link!, manualValue: event.target.checked});
    }

    const selectedInput = link?.outputKey;

    return <Box sx={{display: "flex", flexWrap: "wrap", p: 1, m: 1}}>
        {!link ? null : <>
            <OutputSourceSelect selectedInput={selectedInput}
                                label={"Value"}
                                handleChange={handleSelectedInputChange}
            />
            <Box sx={{m: 1, width: 320}}>
                <Typography gutterBottom>Threshold</Typography>
                <Slider value={link.threshold} onChange={handleThresholdChange} step={0.01} min={0} max={1.0}
                        disabled={!selectedInput}></Slider>


            </Box>
            <Box sx={{m: 1}}>
                <Typography gutterBottom>Manual Value</Typography>
                <Switch defaultChecked
                        value={link.manualValue}
                        onChange={handleManualValueChange}
                        disabled={!!selectedInput}
                />
            </Box>
        </>
        }
    </Box>
}