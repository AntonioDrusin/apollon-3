import {Box} from "@mui/material";
import {KeysOfNeurosityData} from "../../../neurosity-adapter/OutputDataSource";
import React, {useEffect, useState} from "react";
import {NumberSelect} from "./NumberSelect";
import {ColorModeSelect} from "./ColorModeSelect";
import {InputInfo} from "../../../visualizers/VisualizerDirectory";
import {ColorLink} from "../../../link/ScreenLink";
import {colorModes} from "../../../link/ColorTransmission";
import {Register} from "../../../Register";
import * as _ from "lodash";

export interface ColorSettingsProps {
    info: InputInfo;
    linkIndex: number;
    mapKey: string;
}

export function ColorSettings({info, linkIndex, mapKey}: ColorSettingsProps) {
    const [link, setLink] = useState<ColorLink>();
    const [store] = useState(Register.outputMapStore);

    useEffect(() => {
        const sub = store.parameterMap$
            .subscribe((parameters) => {
                const parameter = parameters[mapKey];
                if (parameter) {
                    const newLink = parameter.links[linkIndex];
                    if (newLink && newLink.type === "color" && !_.isEqual(newLink.colorLink, link)) {
                        setLink({...newLink.colorLink!});
                    }
                }
            });

        return () => {
            sub.unsubscribe();
        };
    }, [link, store, linkIndex, mapKey]);

    const updateLink = (newLink: ColorLink) => {
        store.setParameterLink(mapKey, linkIndex, newLink);
    }

    const handleManualValueChange = (index: number, value: number) => {
        const updated = _.cloneDeep(link!);
        updated.colorModeLinks[link!.colorMode].links[index].manualValue = value;
        updateLink(updated);
    }

    const handleClampChange = (index: number, lowClamp: number, highClamp: number) => {
        const updated = _.cloneDeep(link!);
        updated.colorModeLinks[link!.colorMode].links[index].lowValue = lowClamp;
        updated.colorModeLinks[link!.colorMode].links[index].highValue = highClamp;
        updateLink(updated);
    }

    const handleSelectionChange = (index: number, value: string) => {
        const updated = _.cloneDeep(link!);
        updated.colorModeLinks[link!.colorMode].links[index].outputKey = value as KeysOfNeurosityData | undefined;
        updateLink(updated);
    }

    const handleSetColorMode = (colorMode: string) => {
        const updated = _.cloneDeep(link!);
        updated!.colorMode = colorMode
        updateLink(updated);
    }

    return <>
        {!link ? null :
            colorModes[link.colorMode as KeysOfNeurosityData].inputNames.map((colorPartName, index) => {
                return <Box sx={{display: "flex", flexWrap: "wrap", p: 1, m: 1}} key={`${index}-box`}>
                    <NumberSelect key={`${index}-os`}
                                  label={colorPartName}
                                  manualValue={link.colorModeLinks[link.colorMode].links[index]?.manualValue || 0}
                                  lowValue={link.colorModeLinks[link.colorMode].links[index]?.lowValue || 0}
                                  highValue={link.colorModeLinks[link.colorMode].links[index]?.highValue || 0}
                                  onManualValueChange={(value) => handleManualValueChange(index, value)}
                                  onSelectionChange={(selectedInput) => handleSelectionChange(index, selectedInput)}
                                  onClampChange={(lowClamp, highClamp) => handleClampChange(index, lowClamp, highClamp)}
                                  selectedInput={link.colorModeLinks[link.colorMode].links[index]?.outputKey}/>
                </Box>;
            })
        }
        <Box sx={{display: "flex", flexWrap: "wrap", p: 1, m: 1}}>
            <ColorModeSelect id={`${info.propertyKey}-color-mode`} value={link?.colorMode || "rgb"}
                             onChange={(value) => handleSetColorMode(value)}/>
        </Box>
    </>
}