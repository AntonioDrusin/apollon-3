import {Box} from "@mui/material";
import {KeysOfNeurosityData} from "../../../neurosity-adapter/OutputDataSource";
import React, {useEffect, useState} from "react";
import {NumberSelect} from "./NumberSelect";
import {Register} from "../../../Register";
import {NumberLink} from "../../../link/ScreenLink";
import * as _ from 'lodash';

export interface NumberSettingsProps {
    linkIndex: number;
    mapKey: string;
    rangeBackground?: string;
}

export function NumberSettings({linkIndex, mapKey, rangeBackground}: NumberSettingsProps) {
    const [store] = useState(Register.outputMapStore);
    const [link, setLink] = useState<NumberLink>();

    // Rewrite to not use state

    useEffect(() => {
        const sub = store.parameterMap$
            .subscribe((parameters) => {
                const parameter = parameters[mapKey];
                if (parameter) {
                    const newLink = parameter.links[linkIndex];
                    if (newLink && newLink.type === "number" && !_.isEqual(newLink.numberLink, link)) {
                        setLink({...newLink.numberLink!});
                    }
                }
            });

        return () => {
            sub.unsubscribe();
        }
    }, [store, linkIndex, mapKey, link]);

    const updateLink = (newLink: NumberLink) => {
        store.setParameterLink(mapKey, linkIndex, newLink);
    }

    const handleManualSignalChange = (value: number) => {
        updateLink({...link!,
            manualValue: value
        });
    };
    const handleClampChange = (lowClamp: number, highClamp: number) => {
        updateLink({...link!,
            lowValue: lowClamp,
            highValue: highClamp,
        });
    };

    const handleSelectedInputChange = (value: string) => {
        if ( link! ) {
            updateLink({...link,
                outputKey: value as KeysOfNeurosityData | undefined,
            });
        }
    }

    return <Box sx={{display: "flex", flexWrap: "wrap", p: 1, m: 1}}>
        {!link ? null :
            <NumberSelect label={"Value"}
                          manualValue={link.manualValue || 0}
                          lowValue={link.lowValue}
                          highValue={link.highValue}
                          onSelectionChange={(selectedInput) => handleSelectedInputChange(selectedInput)}
                          onManualValueChange={handleManualSignalChange}
                          onClampChange={handleClampChange}
                          rangeBackground={rangeBackground}
                          selectedInput={link.outputKey}/>
        }
    </Box>
}