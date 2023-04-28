import {InputInfo} from "../../../visualizers/VisualizerDirectory";
import {Box} from "@mui/material";
import {KeysOfNeurosityData} from "../../../neurosity-adapter/OutputDataSource";
import React, {useEffect, useState} from "react";
import {NumberSelect} from "./NumberSelect";
import {Register} from "../../../Register";
import {NumberLink} from "../../../link/ScreenLink";
import {take} from "rxjs";

export interface NumberSettingsProps {
    info: InputInfo;
    linkIndex: number;
    mapKey: string
}

export function NumberSettings({info, linkIndex, mapKey}: NumberSettingsProps) {
    const [store] = useState(Register.outputMapStore);
    const [link, setLink] = useState<NumberLink>();

    // Rewrite to not use state

    useEffect(() => {
        const sub = store.parameterMap$
            .subscribe((parameters) => {
                const parameter = parameters[mapKey];
                if (parameter) {
                    const newLink = parameter.links[linkIndex];
                    if (newLink && newLink.type === "number") {
                        setLink({...newLink.numberLink!});
                    }
                }
            });

        return () => {
            sub.unsubscribe();
        }
    }, [store, linkIndex, mapKey]);

    const updateLink = () => {
        setLink({...link!});
        store.setParameterLink(mapKey, linkIndex, link!);
    }

    const handleManualSignalChange = (value: number) => {
            link!.manualValue = value;
            updateLink();
    };
    const handleClampChange = (lowClamp: number, highClamp: number) => {
        link!.lowValue = lowClamp;
        link!.highValue = highClamp;
        updateLink();
    };

    const handleSelectedInputChange = (value: string) => {
        if (link) {
            link.outputKey = value as KeysOfNeurosityData | undefined;
            updateLink();
        }
    }

    return <Box sx={{display: "flex", flexWrap: "wrap", p: 1, m: 1}}>
        {!link ? null :
            <NumberSelect id={info.propertyKey}
                          label={"Value"}
                          manualValue={link.manualValue || 0}
                          lowValue={link.lowValue}
                          highValue={link.highValue}
                          onSelectionChange={(selectedInput) => handleSelectedInputChange(selectedInput)}
                          onManualValueChange={handleManualSignalChange}
                          onClampChange={handleClampChange}
                          selectedInput={link.outputKey}/>
        }
    </Box>
}