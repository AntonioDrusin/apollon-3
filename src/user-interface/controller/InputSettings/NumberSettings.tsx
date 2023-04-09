import {InputInfo} from "../../../visualizers/VisualizerDirectory";
import {Box} from "@mui/material";
import {KeysOfNeurosityData} from "../../../neurosity-adapter/OutputDataSource";
import React, {useEffect, useState} from "react";
import {OutputSelect} from "./OutputSelect";
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
            .pipe(take(1))
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

    const handleSelectedInputChange = (value: string) => {
        if (link) {
            link.outputKey = value as KeysOfNeurosityData | undefined;
            updateLink();
        }
    }

    return <Box sx={{display: "flex", flexWrap: "wrap", p: 1, m: 1}}>
        {!link ? null :
            <OutputSelect id={info.propertyKey}
                          label={"Value"}
                          manualValue={link.manualValue || 0}
                          onSelectionChange={(selectedInput) => handleSelectedInputChange(selectedInput)}
                          onManualValueChange={handleManualSignalChange}
                          selectedInput={link.outputKey}/>
        }
    </Box>
}