import {Box, Slider, styled, Typography} from "@mui/material";
import React, {useContext, useEffect, useMemo, useState} from "react";
import {Register} from "../../../Register";
import {getThemeByName, ThemeContext} from "../../../App";

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

function formatDuration(value: number) {
    const minute = Math.floor(value / 60);
    const secondLeft = Math.floor(value - minute * 60);
    return `${minute}:${secondLeft < 10 ? `0${secondLeft}` : secondLeft}`;
}

export default function FilePlaybackProgress() {
    const fileReader = useMemo(() => {
        return Register.neurosityFileReader
    }, []);
    const [position, setPosition] = useState<number>(0);
    const themeContext = useContext(ThemeContext);
    const theme = getThemeByName(themeContext.themeName);
    const [marks, setMarks] = useState<Mark[]>([]);
    const [durationMilliseconds, setDurationMilliseconds] = useState<number>(0);


    const handlePositionChange = (event: Event, newValue: number | number[]) => {
        fileReader.setPositionSeconds(Math.floor((newValue as number) / 1000));
    }

    useEffect(() => {
        const sub = fileReader.active$.subscribe((started) => {
            setDurationMilliseconds(started.durationMilliseconds);
            if (started.tags) {
                const marks = started.tags.map(t => ({value: t.locationMilliseconds, label: ""} as Mark));
                setMarks(marks);
            }
        });
        const playSub = fileReader.playStatus$.subscribe((status) => {
            setPosition(status.locationMilliseconds);
        });
        return () => {
            sub.unsubscribe();
            playSub.unsubscribe();
        };
    }, [fileReader]);

    return <Box sx={{flexGrow: 1, mx: 2}}>
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
}