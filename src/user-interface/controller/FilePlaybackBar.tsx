import React, {useContext, useEffect, useMemo, useState} from "react";
import {
    Autocomplete, AutocompleteChangeReason,
    Box,
    Card,
    Container,
    IconButton,
    Slider, styled,
    TextField, Typography,
} from "@mui/material";
import {PlayArrow, Pause, Eject} from "@mui/icons-material";
import {Register} from "../../Register";
import {FileTag} from "../../neurosity-adapter/FilePlayback";
import {getThemeByName, ThemeContext} from "../../App";

const TinyText = styled(Typography)({
    fontSize: '0.75rem',
    opacity: 0.38,
    fontWeight: 500,
    letterSpacing: 0.2,
});

interface Mark {
    value: number;
    label: string;
}

export default function FilePlaybackBar() {
    const [hidden, setHidden] = useState(true);
    const fileReader = useMemo(() => {
        return Register.neurosityFileReader
    }, []);
    const [tags, setTags] = useState<FileTag[]>([]);
    const [marks, setMarks] = useState<Mark[]>([]);
    const [play, setPlay] = useState<boolean>(false);
    const [position, setPosition] = useState<number>(0);
    const [durationMilliseconds, setDurationMilliseconds] = useState<number>(0);
    const themeContext = useContext(ThemeContext);
    const theme = getThemeByName(themeContext.themeName);

    function formatDuration(value: number) {
        const minute = Math.floor(value / 60);
        const secondLeft = Math.floor(value - minute * 60);
        return `${minute}:${secondLeft < 10 ? `0${secondLeft}` : secondLeft}`;
    }

    useEffect(() => {
        const sub = fileReader.active$.subscribe((started) => {
            setHidden(!started.active);
            setDurationMilliseconds(started.durationMilliseconds);
            if (started.tags) {
                setTags([...started.tags]);
                const marks = started.tags.map(t => ({value: t.locationMilliseconds, label: ""} as Mark));
                setMarks(marks);
            }
        });
        const playSub = fileReader.playStatus$.subscribe((status) => {
            setPlay(status.play);
            setPosition(status.locationMilliseconds);
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

    const handlePositionChange = (event: Event, newValue: number | number[]) => {
        fileReader.setPositionSeconds(Math.floor((newValue as number) / 1000));
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
                    <Box sx={{flexGrow: 1, mx: 2}}>
                        <Slider
                            onChange={handlePositionChange}
                            value={position}
                            min={0}
                            max={durationMilliseconds}
                            size="small"
                            marks={marks}
                            sx={{
                                color: theme.palette.mode === 'dark' ? '#fff' : 'rgba(0,0,0,0.87)',
                                height: 4,
                                '& .MuiSlider-rail': {
                                    opacity: 0.28,
                                },
                            }}/>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                mt: -2,
                            }}
                        >
                            <TinyText>{formatDuration(position/1000)}</TinyText>
                            <TinyText>-{formatDuration((durationMilliseconds - position)/1000)}</TinyText>
                        </Box>
                    </Box>
                </Box>

            </Card>
        </Container>
    </Box>
}