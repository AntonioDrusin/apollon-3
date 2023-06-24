import React, {useEffect, useState} from "react";
import {Register} from "../../../Register";
import {ImageLink} from "../../../link/ScreenLink";
import {Box, Button} from "@mui/material";
import {useTranslation} from "react-i18next";

export interface ImageSettingsProps {
    linkIndex: number;
    mapKey: string
}


export function ImageSettings({linkIndex, mapKey}: ImageSettingsProps) {
    const [store] = useState(Register.outputMapStore);
    const [link, setLink] = useState<ImageLink>();

    useEffect(() => {
        const sub = store.parameterMap$
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
        store.setParameterLink(mapKey, linkIndex, {...link!});
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

    const {t}= useTranslation();
    return <Box sx={{display: "flex", flexWrap: "wrap", p: 1, m: 1}}>
        {!link ? null : <>
            <Box hidden={!link.imageUrl}>
                <img alt={t("image.texturePreview")} style={{width: "100%"}} src={link.imageUrl}></img>
            </Box>
            <Button variant="contained" component="label" sx={{mx: 1}}>
                {t("image.upload")}
                <input hidden accept="image/*" multiple type="file" onChange={handleFileChanged}/>
            </Button>
            <Button disabled={!link.imageUrl} variant="contained" component="label" sx={{mx: 1}} onClick={handleFileClear}>
                {t("image.clear")}
            </Button>
        </>
        }
    </Box>
}