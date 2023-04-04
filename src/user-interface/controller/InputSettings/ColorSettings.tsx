import {Box} from "@mui/material";
import {KeysOfNeurosityData} from "../../../neurosity-adapter/OutputDataSource";
import React, {useEffect, useState} from "react";
import {OutputSelect} from "./OutputSelect";
import {ColorModeSelect} from "./ColorModeSelect";
import {InputInfo} from "../../../visualizers/VisualizerDirectory";
import {NumbersLink, ParameterLink} from "../../../link/ScreenLink";
import * as _ from "lodash";

import {colorModes, ColorModes} from "../../../link/ColorTransmission";

export interface ColorSettingsProps {
    info: InputInfo;
    link: ParameterLink;

    onParameterChange(link: ParameterLink): void;
}

export interface NumberLinkValue {
    manualValue: number;
    outputKey: KeysOfNeurosityData | undefined | "Manual";
}

type ColorInputValues = {
    numberLinks: NumberLinkValue[];
}
type ColorInputForModes = { [k: ColorModes]: ColorInputValues };

export function ColorSettings({info, link, onParameterChange}: ColorSettingsProps) {
    const [values, setValues] = useState<ColorInputForModes>({});
    const [colorMode, setColorMode] = useState<ColorModes>("rgb");
    const [manualValue, setManualValue] = useState<number[]>([0, 0, 0]);


    useEffect(() => {
        console.log(JSON.stringify(link));
    }, [link]);

    useEffect(() => {
        // define a type for this guy
        const mappedValues: { [key in ColorModes]: NumbersLink } = {};

        _.forEach(values, (value, key) => {
            mappedValues[key] = {
                links: _.map(value.numberLinks, (v, index) => {
                    return {
                        manualValue: manualValue[index],
                        outputKey: v.outputKey && v.outputKey !== "Manual" ? v.outputKey : undefined
                    }
                })
            }
        });

        onParameterChange({
            propertyKey: info.propertyKey,
            type: "color",
            colorLink: {
                colorMode: colorMode,
                values: mappedValues,
            }
        });

    }, [manualValue, colorMode, values, onParameterChange, info]);

    const onManualValueChange = (index: number, value: number) => {
        const newValue = [...manualValue];
        newValue[index] = value;
        setManualValue(newValue);
    }

    const changeSelectedInput = (index: number, selectedInput: string) => {
        const updated = {...values};
        if (!updated[colorMode as ColorModes]) {
            updated[colorMode as ColorModes] = {
                numberLinks: [
                    {manualValue: 0, outputKey: "Manual"},
                    {manualValue: 0, outputKey: "Manual"},
                    {manualValue: 0, outputKey: "Manual"}]
            };
        }
        updated[colorMode as ColorModes].numberLinks[index].outputKey = selectedInput as KeysOfNeurosityData;

        setValues(updated);
    };

    return <>
        {
            colorModes[colorMode as KeysOfNeurosityData].inputNames.map((colorPartName, index) => {
                return <Box sx={{display: "flex", flexWrap: "wrap", p: 1, m: 1}} key={`${index}-box`}>
                    <OutputSelect id={"k1-first"}
                                  key={`${index}-os`}
                                  label={colorPartName}
                                  manualValue={manualValue[index]}
                                  onManualValueChange={(value) => onManualValueChange(index, value)}
                                  onSelectionChange={(selectedInput) => changeSelectedInput(index, selectedInput)}
                                  selectedInput={values[colorMode]?.numberLinks[index]?.outputKey}/>
                </Box>;
            })
        }
        <Box sx={{display: "flex", flexWrap: "wrap", p: 1, m: 1}}>
            <ColorModeSelect id={`${info.propertyKey}-color-mode`} value={colorMode}
                             onChange={(value) => setColorMode(value)}/>
        </Box>
    </>
}