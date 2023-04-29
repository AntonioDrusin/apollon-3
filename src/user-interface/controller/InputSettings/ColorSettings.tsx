import {Box} from "@mui/material";
import {KeysOfNeurosityData} from "../../../neurosity-adapter/OutputDataSource";
import React, {useEffect, useState} from "react";
import {NumberSelect} from "./NumberSelect";
import {ColorModeSelect} from "./ColorModeSelect";
import {InputInfo} from "../../../visualizers/VisualizerDirectory";
import {ColorLink} from "../../../link/ScreenLink";
import {colorModes} from "../../../link/ColorTransmission";
import {Register} from "../../../Register";
import {take} from "rxjs";

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
                    const link = parameter.links[linkIndex];
                    if (link && link.type === "color") {
                        setLink({...link.colorLink!});
                    }
                }
            });

        return () => {
            sub.unsubscribe();
        };
    }, [store, linkIndex, mapKey]);

    const updateLink = (updated: ColorLink) => {
        store.setParameterLink(mapKey, linkIndex, updated);
    }

    const onManualValueChange = (index: number, value: number) => {
        const updated = {...link!};
        updated.colorModeLinks[link!.colorMode].links[index].manualValue = value;
        updateLink(updated);
    }

    const handleClampChange = (index: number, lowClamp: number, highClamp: number) => {
        const updated = {...link!};
        updated.colorModeLinks[link!.colorMode].links[index].lowValue = lowClamp;
        updated.colorModeLinks[link!.colorMode].links[index].highValue = highClamp;
        updateLink(updated);
    }

    const onSelectionChange = (index: number, value: string) => {
        const updated = {...link!};
        updated.colorModeLinks[link!.colorMode].links[index].outputKey = value as KeysOfNeurosityData | undefined;
        updateLink(updated);
    }

    const onSetColorMode = (colorMode: string) => {
        const updated = {...link!};
        updated!.colorMode = colorMode
        updateLink(updated);
    }

    return <>
        {!link ? null :
            colorModes[link.colorMode as KeysOfNeurosityData].inputNames.map((colorPartName, index) => {
                return <Box sx={{display: "flex", flexWrap: "wrap", p: 1, m: 1}} key={`${index}-box`}>
                    <NumberSelect id={"k1-first"}
                                  key={`${index}-os`}
                                  label={colorPartName}
                                  manualValue={link.colorModeLinks[link.colorMode].links[index]?.manualValue || 0}
                                  lowValue={link.colorModeLinks[link.colorMode].links[index]?.lowValue || 0}
                                  highValue={link.colorModeLinks[link.colorMode].links[index]?.highValue || 0}
                                  onManualValueChange={(value) => onManualValueChange(index, value)}
                                  onSelectionChange={(selectedInput) => onSelectionChange(index, selectedInput)}
                                  onClampChange={(lowClamp, highClamp) => handleClampChange(index, lowClamp, highClamp)}
                                  selectedInput={link.colorModeLinks[link.colorMode].links[index]?.outputKey}/>
                </Box>;
            })
        }
        <Box sx={{display: "flex", flexWrap: "wrap", p: 1, m: 1}}>
            <ColorModeSelect id={`${info.propertyKey}-color-mode`} value={link?.colorMode || "rgb"}
                             onChange={(value) => onSetColorMode(value)}/>
        </Box>
    </>
}