import React, {useEffect, useState} from "react";
import {InputInfo} from "../../../visualizers/VisualizerDirectory";
import {NumberSettingsProps} from "./NumberSettings";
import {Register} from "../../../Register";
import {ImageLink} from "../../../link/ScreenLink";
import {take} from "rxjs";
import {Box, Button, Typography} from "@mui/material";
import {KeysOfNeurosityData} from "../../../neurosity-adapter/OutputDataSource";

export interface ImageSettingsProps {
    info: InputInfo;
    linkIndex: number;
    mapKey: string
}


export function ImageSettings({info, linkIndex, mapKey}: NumberSettingsProps) {
    const [store] = useState(Register.outputMapStore);
    const [link, setLink] = useState<ImageLink>();

    useEffect(() => {
        const sub = store.parameterMap$
            .pipe(take(1))
            .subscribe((parameters) => {
                const parameter = parameters[mapKey];
                if (parameter) {
                    const newLink = parameter.links[linkIndex];
                    if (newLink && newLink.type === "image") {
                        setLink({...newLink.imageLink!});
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

    const handleFileChanged = async (input: any) => {
        const file = input.currentTarget.files[0];
        if (file) {
            const reader = new FileReader();
            reader.addEventListener("load", () => {
                link!.imageUrl = reader.result as string;
                updateLink();
            });
            reader.readAsDataURL(file);
        }
    }
    const handleFileClear = () => {
        if (link) {
            link!.imageUrl = undefined;
            updateLink();
        }
    }

    return <Box sx={{display: "flex", flexWrap: "wrap", p: 1, m: 1}}>
        {!link ? null : <>
            <Box>
                <img style={{width: "100%"}} src={link.imageUrl}></img>
            </Box>
            <Button variant="contained" component="label" sx={{mx: 1}}>
                Upload
                <input hidden accept="image/*" multiple type="file" onChange={handleFileChanged}/>
            </Button>
            <Button variant="contained" component="label" sx={{mx: 1}} onClick={handleFileClear}>
                Clear
            </Button>
        </>
        }
    </Box>
}