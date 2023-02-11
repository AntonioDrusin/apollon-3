import React, {useContext, useEffect, useMemo, useState} from "react";
import {
    Box,
    Card,
    Container,
    ToggleButton,
    OutlinedInput,
    IconButton,
    InputAdornment,
    Typography
} from "@mui/material";
import {FiberManualRecord, Label, Close} from "@mui/icons-material";
import {LayoutContext} from "./LayoutContext";
import {Register} from "../../Register";
import moment from "moment";
import {humanFileSize} from "../../services/HumanFileSize";

export interface RecordingBarProps {
    hidden: boolean;
};

export default function RecordingBar({hidden}: RecordingBarProps) {
    const [recording, setRecording] = useState(false);
    const [label, setLabel] = useState("");
    const [size, setSize] = useState<number>();
    const [timeLength, setTimeLength] = useState<number>();
    const [name, setName] = useState<string>();

    const layoutContext = useContext(LayoutContext);
    const dataPersister = useMemo(() => Register.neurosityDataPersister, []);

    const handleLabeling = () => {
        const tag = label || new Date().toLocaleString();
        dataPersister.addTag(tag);
        layoutContext.setSnackMessage('Stream labeled: "' + tag + '"');
        setLabel("");
    };

    const handleKeyDown = (e: any) => {
        if ( e.keyCode === 13 ) {
            handleLabeling();
        }
    }

    const handleRecording = async () => {
        const isRecordingNow = !recording;
        if (isRecordingNow) {
            const recordingStarted = await dataPersister.startRecording();
            if (recordingStarted) {
                layoutContext.setSnackMessage('Recording Started');
            }
        } else {
            await dataPersister.stopRecording();
            layoutContext.setSnackMessage('Recording completed: ' + name);
            setRecording(false);
        }
    };

    const handleClose = async () => {
        layoutContext.setRecordingBar(false);
    };

    useEffect(() => {
        if (dataPersister) {
            const sub = dataPersister.status$.subscribe((status) => {
                setSize(status.currentFileLength);
                setTimeLength(status.lastSaveTime.getTime() - status.startTime.getTime());
                setName(status.recordingFileName);
                setRecording(true);
            });
            return () => {
                sub.unsubscribe();
            }
        }
    }, [dataPersister]);

    const humanTime = recording ? moment.duration(timeLength || 0).humanize() : "";
    const humanSize = recording ? humanFileSize(size || 0) : "";

    return <Box hidden={hidden}><Container maxWidth="xl">
        <Card sx={{p: 1, m: 1}}>
            <Box sx={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                <ToggleButton sx={{mx: 1}}
                              value="recording"
                              selected={recording}
                              onChange={async () => await handleRecording()}
                              color={"primary"}
                >
                    <FiberManualRecord/>
                </ToggleButton>
                <OutlinedInput sx={{mx: 1, minWidth: 640}}
                               id="outlined-basic"
                               value={label}
                               disabled={!recording}
                               onChange={(e) => setLabel(e.target.value)}
                               onKeyDown={handleKeyDown}
                               endAdornment={
                                   <InputAdornment position="end">
                                       <IconButton
                                           disabled={!recording}
                                           aria-label="toggle password visibility"
                                           onClick={handleLabeling}
                                           edge="end"
                                       >
                                           <Label/>
                                       </IconButton>
                                   </InputAdornment>
                               }
                />
                {recording && <Container sx={{display: 'flex', flexDirection: 'row', flexGrow: 0}}>
                    <Box sx={{mx: 1}}>
                        <Typography>{humanTime}</Typography>
                    </Box>

                    <Box sx={{flexDirection: "column", mx: 1}}>
                        <Typography>{humanSize}</Typography>
                        <Typography variant={"caption"}>{name}</Typography>
                    </Box>
                </Container>
                }
                <Box sx={{flexGrow: 1}}></Box>
                <IconButton onClick={async () => {
                    await handleClose()
                }}>
                    <Close/>
                </IconButton>
            </Box>
        </Card>
    </Container></Box>
}