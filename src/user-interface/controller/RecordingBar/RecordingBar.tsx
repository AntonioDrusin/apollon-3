import React, {useContext, useEffect, useMemo, useState} from "react";
import {
    Box,
    Card,
    Container,
    ToggleButton,
    OutlinedInput,
    IconButton,
    InputAdornment
} from "@mui/material";
import {FiberManualRecord, Label, Close} from "@mui/icons-material";
import {RecordingBarContext, SnackBarContext} from "../ContextProvider/Context";
import {Register} from "../../../Register";
import RecordingBarTicker from "./RecordingBarTicker";

export default function RecordingBar() {
    const [recording, setRecording] = useState(false);
    const [label, setLabel] = useState("");
    const snackContext = useContext(SnackBarContext);
    const recordingContext = useContext(RecordingBarContext)
    const dataPersister = useMemo(() => Register.neurosityFileWriter, []);
    const transmitter = useMemo(() => Register.screenLink, []);
    const [name, setName] = useState<string>();

    useEffect(() => {
        if (dataPersister) {
            const sub = dataPersister.status$.subscribe((status) => {
                setName(status.recordingFileName)
            });
            const subStatus = dataPersister.recordingStatus$.subscribe((recStatus) => {
                setRecording(recStatus.recording)
            })
            return () => {
                sub.unsubscribe();
                subStatus.unsubscribe();
            }
        }
    }, [dataPersister]);

    useEffect( () => {
        const sub = transmitter.visualizerChanges$.subscribe( (v) => {
            if ( recording ) {
                const tag = v.visualizer ? "Visualizer " + v.visualizer : "Visualizer stop";
                dataPersister.addTag(tag);
                snackContext.setSnackMessage('Stream labeled: "' + tag + '"');
            }
        });
        return () => { sub.unsubscribe()};
    }, [transmitter, dataPersister, snackContext]);

    const handleLabeling = () => {
        const tag = label || new Date().toLocaleString();
        dataPersister.addTag(tag);
        snackContext.setSnackMessage('Stream labeled: "' + tag + '"');
        setLabel("");
    };


    const handleKeyDown = (e: any) => {
        if (e.keyCode === 13) {
            handleLabeling();
        }
    }

    const handleRecording = async () => {
        const isRecordingNow = !recording;
        if (isRecordingNow) {
            const recordingStarted = await dataPersister.startRecording();
            if (recordingStarted) {
                snackContext.setSnackMessage('Recording Started');
            }
        } else {
            await dataPersister.stopRecording();
            snackContext.setSnackMessage('Recording completed: ' + name);
        }
    };

    const handleClose = async () => {
        recordingContext.setRecordingBar(false);
    };

    return <Box hidden={!recordingContext.recordingBar}><Container maxWidth="xl">
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
                {recording && <RecordingBarTicker></RecordingBarTicker>
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