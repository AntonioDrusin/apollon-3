import {Box} from "@mui/material";
import {KeysOfNeurosityData} from "../../../neurosity-adapter/OutputDataSource";
import React, {useEffect, useState} from "react";
import {OutputSelect} from "./OutputSelect";
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
            .pipe(take(1))
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

    const updateLink = () => {
        store.setParameterLink(mapKey, linkIndex, {
            propertyKey: info.propertyKey,
            type: "color",
            colorLink: link,
        });
    }

    const onManualValueChange = (index: number, value: number) => {
        if (link) {
            link.colorModeLinks[link.colorMode].links[index].manualValue = value;
            setLink({...link});
            updateLink();
        }
    }

    const onSelectionChange = (index: number, value: string) => {
        if (link) {
            link.colorModeLinks[link.colorMode].links[index].outputKey = value as KeysOfNeurosityData | undefined;
            setLink({...link});
            updateLink();
        }
    }

    const onSetColorMode = (colorMode: string) => {
        if (link) {
            link.colorMode = colorMode
            setLink({...link});
            updateLink();
        }
    }

    return <>
        {!link ? null :
            colorModes[link.colorMode as KeysOfNeurosityData].inputNames.map((colorPartName, index) => {
                return <Box sx={{display: "flex", flexWrap: "wrap", p: 1, m: 1}} key={`${index}-box`}>
                    <OutputSelect id={"k1-first"}
                                  key={`${index}-os`}
                                  label={colorPartName}
                                  manualValue={link?.colorModeLinks[link.colorMode].links[index]?.manualValue || 0}
                                  onManualValueChange={(value) => onManualValueChange(index, value)}
                                  onSelectionChange={(selectedInput) => onSelectionChange(index, selectedInput)}
                                  selectedInput={link?.colorModeLinks[link.colorMode].links[index]?.outputKey}/>
                </Box>;
            })
        }
        <Box sx={{display: "flex", flexWrap: "wrap", p: 1, m: 1}}>
            <ColorModeSelect id={`${info.propertyKey}-color-mode`} value={link?.colorMode || "rgb"}
                             onChange={(value) => onSetColorMode(value)}/>
        </Box>
    </>
}