import {Box, Slider, Typography} from "@mui/material";
import React, {useEffect, useState} from "react";
import {InputInfo} from "../../../visualizers/VisualizerDirectory";
import {Register} from "../../../Register";
import {BooleanLink, BooleanModulations} from "../../../link/ScreenLink";
import {KeysOfNeurosityData} from "../../../neurosity-adapter/OutputDataSource";
import * as _ from "lodash";
import {BooleanModeSelect} from "./BooleanModeSelect";
import {NumberSelect} from "./NumberSelect";

export interface BooleanSettingsProps {
    info: InputInfo;
    linkIndex: number;
    mapKey: string
}

export function BooleanSettings({info, linkIndex, mapKey}: BooleanSettingsProps) {
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

    const handleThresholdChange = (event: any) => {
        const updated = _.cloneDeep(link!);
        updated.threshold = event.target.value;
        updateLink(updated);
    }

    const handleManualValueChange = (value: number) => {
        const updated = _.cloneDeep(link!);
        updated.numberLink.manualValue = value;
        updateLink(updated);
    }

    const handleModeChange = (value: BooleanModulations) => {
        const updated = _.cloneDeep(link!);
        updated.modulation = value;
        updateLink(updated);
    }

    const handleSelectionChange = (value: string) => {
        const updated = _.cloneDeep(link!);
        updated.numberLink.outputKey =  value as KeysOfNeurosityData | undefined;
        updateLink(updated);
    }

    const handleCurveChange = (value: string) => {
        const updated = _.cloneDeep(link!);
        updated.numberLink.curve =  value ?? 'linear';
        updateLink(updated);
    }

    const handleClampChange = (lowClamp: number, highClamp: number) => {
        const updated = _.cloneDeep(link!);
        updated.numberLink.lowValue = lowClamp;
        updated.numberLink.highValue = highClamp;
        updateLink(updated);
    }

    return <Box sx={{display: "flex", flexWrap: "wrap", p: 1, m: 1}}>
        {!link ? null : <>
            <NumberSelect key={`${info.propertyKey}-os`}
                          label={"Value"}
                          manualValue={link.numberLink.manualValue || 0}
                          lowValue={link.numberLink.lowValue || 0}
                          highValue={link.numberLink.highValue || 0}
                          onManualValueChange={(value) => handleManualValueChange(value)}
                          onSelectionChange={(selectedInput) => handleSelectionChange(selectedInput)}
                          onCurveChange={(curve) => handleCurveChange(curve)}
                          onClampChange={(lowClamp, highClamp) => handleClampChange(lowClamp, highClamp)}
                          selectedInput={link.numberLink.outputKey}
                          selectedCurve={link.numberLink.curve}
            />

            <Box sx={{display: "flex", flexWrap: "wrap", m: 1, width: "100%"}}>
                <BooleanModeSelect onChange={handleModeChange} id={`${info.propertyKey}-boolean-mode`}
                                   value={link.modulation}/>
            </Box>
            <Box sx={{m: 1, width: "100%"}}>
                <Typography gutterBottom>Threshold</Typography>
                <Slider value={link.threshold} onChange={handleThresholdChange} step={0.01} min={0} max={1.0}
                        size={"small"}></Slider>
            </Box>
        </>
        }
    </Box>
}