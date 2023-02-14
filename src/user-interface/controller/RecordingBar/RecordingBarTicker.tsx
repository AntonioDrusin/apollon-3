import {Box, Container, Typography} from "@mui/material";
import React, {useEffect, useMemo, useState} from "react";
import moment from "moment/moment";
import {humanFileSize} from "../../../services/HumanFileSize";
import {Register} from "../../../Register";

export default function RecordingBarTicker() {
    const [recording, setRecording] = useState(false);
    const [size, setSize] = useState<number>();
    const [timeLength, setTimeLength] = useState<number>();
    const dataPersister = useMemo(() => Register.neurosityFileWriter, []);
    const [name, setName] = useState<string>();

    useEffect(() => {
        if (dataPersister) {
            const sub = dataPersister.status$.subscribe((status) => {
                setSize(status.currentFileLength);
                setName(status.recordingFileName);
                setTimeLength(status.lastSaveTime.getTime() - status.startTime.getTime());
                setRecording(true);
            });
            return () => {
                sub.unsubscribe();
            }
        }
    }, [dataPersister]);

    const humanTime = recording ? moment.utc(timeLength || 0).format("HH:mm:ss") : "";
    const humanSize = recording ? humanFileSize(size || 0) : "";

    return <Container sx={{display: 'flex', flexDirection: 'row', flexGrow: 0}}>
        <Box sx={{mx: 1}}>
            <Typography>{humanTime}</Typography>
        </Box>
        <Box sx={{flexDirection: "column", mx: 1}}>
            <Typography>{humanSize}</Typography>
            <Typography variant={"caption"}>{name}</Typography>
        </Box>
    </Container>
}