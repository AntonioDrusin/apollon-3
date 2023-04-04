import {InputInfo} from "../../../visualizers/VisualizerDirectory";
import {ParameterLink} from "../../../link/ScreenLink";
import {Box} from "@mui/material";
import {KeysOfNeurosityData} from "../../../neurosity-adapter/OutputDataSource";
import React, {useEffect, useState} from "react";
import {OutputSelect} from "./OutputSelect";

export interface NumberSettingsProps {
    info: InputInfo;
    link: ParameterLink;

    onParameterChange(link: ParameterLink): void;
}

export function NumberSettings({info, link, onParameterChange}: NumberSettingsProps) {
    const MANUAL = "Manual";
    const [loading, setLoading] = useState(true);
    const [selectedInput, setSelectedInput] = useState<string>(MANUAL);
    const [manualValue, setManualValue] = useState<number>(0);


    useEffect(() => {
        if (link && link.type === "number") {
            setSelectedInput(link.numberLink!.outputKey ?? MANUAL);
            setLoading(false);
        }
    }, [link]);

    useEffect(() => {
        if (!loading) {
            let input: KeysOfNeurosityData | undefined;

            input = selectedInput === MANUAL
                ? undefined
                : selectedInput as KeysOfNeurosityData;

            onParameterChange({
                propertyKey: info.propertyKey,
                type: "number",
                numberLink: {
                    manualValue: manualValue || 0,
                    outputKey: input
                }
            })
        }
    }, [info.propertyKey, loading, manualValue, selectedInput, onParameterChange]);

    const handleManualSignalChange = (value: number) => {
        setManualValue(value);
    };

    return <Box sx={{display: "flex", flexWrap: "wrap", p: 1, m: 1}}>
        <OutputSelect id={info.propertyKey}
                      label={"Value"}
                      manualValue={manualValue}
                      onSelectionChange={(selectedInput) => setSelectedInput(selectedInput)}
                      onManualValueChange={handleManualSignalChange}
                      selectedInput={selectedInput}/>
    </Box>
}