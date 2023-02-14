import React, {useEffect, useMemo, useState} from "react";
import {
    Autocomplete, AutocompleteChangeReason,
    Box,
    Card,
    Container,
    IconButton,
    TextField,
} from "@mui/material";
import {PlayArrow, Pause, Eject} from "@mui/icons-material";
import {Register} from "../../../Register";
import {FileTag} from "../../../neurosity-adapter/FilePlayback";
import FilePlaybackProgress from "./FilePlaybackProgress";


export default function FilePlaybackBar() {
    const [hidden, setHidden] = useState(true);
    const fileReader = useMemo(() => {
        return Register.neurosityFileReader
    }, []);
    const [tags, setTags] = useState<FileTag[]>([]);
    const [play, setPlay] = useState<boolean>(false);

    useEffect(() => {
        const sub = fileReader.active$.subscribe((started) => {
            setHidden(!started.active);
            if (started.tags) {
                setTags([...started.tags]);
            }
        });
        const playSub = fileReader.playStatus$.subscribe((status) => {
            setPlay(status.play);
        });
        return () => {
            sub.unsubscribe();
            playSub.unsubscribe();
        };
    }, [fileReader]);

    const handlePlayPause = () => {
        if (play) {
            fileReader.pause();
        } else {
            fileReader.play();
        }
    };

    const handleEject = () => {
        fileReader.eject();
    }

    const handleTagChange = (event: React.SyntheticEvent<Element, Event>, value: FileTag | null, reason: AutocompleteChangeReason) => {
        if (reason === "selectOption" && value) {
            fileReader.setPositionIndex(value.index);
        }
    }

    return <Box hidden={hidden}>
        <Container maxWidth="xl">
            <Card sx={{p: 1, m: 1}}>
                <Box sx={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                    <Box sx={{flexShrink: 1, mx: 2}}>
                        <IconButton onClick={handlePlayPause}>
                            {play ? <Pause/> : <PlayArrow/>}
                        </IconButton>
                        <IconButton onClick={handleEject}> <Eject/> </IconButton>
                    </Box>
                    <Box sx={{mx: 2}}>
                        <Autocomplete
                            disablePortal
                            disableCloseOnSelect
                            onChange={handleTagChange}
                            isOptionEqualToValue={(option, value) => option.index === value.index}
                            id="combo-box-demo"
                            options={tags}
                            sx={{width: 300}}
                            renderInput={(params) => <TextField {...params} label="Go To..."/>}
                        />
                    </Box>
                    <FilePlaybackProgress></FilePlaybackProgress>
                </Box>
            </Card>
        </Container>
    </Box>
}