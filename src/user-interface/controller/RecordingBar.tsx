import React, {useContext, useEffect, useState} from "react";
import {
    Box,
    Card,
    Container,
    ToggleButtonGroup,
    ToggleButton,
    TextField,
    Button,
    OutlinedInput,
    IconButton,
    ButtonGroup, InputAdornment
} from "@mui/material";
import {FiberManualRecord, Label, Close} from "@mui/icons-material";
import {LayoutContext} from "./LayoutContext";

export interface RecordingBarProps {
    hidden: boolean;
};

export default function RecordingBar({hidden}: RecordingBarProps) {
    const [recording, setRecording] = useState(false);
    const [label, setLabel] = useState("");
    const layoutContext = useContext(LayoutContext);

    const handleLabeling = () => {
        const tag = label || new Date().toLocaleString();
        layoutContext.setSnackMessage('Stream labeled: "' + tag + '"');
        setLabel("");
    };

    const handleRecording = () => {
        setRecording(!recording);
        layoutContext.setSnackMessage(!recording ? 'Recording Started' : 'Recording Stopped');
    };

    const handleClose = () => {
        layoutContext.setRecordingBar(false);
    };

    return <Box hidden={hidden}><Container maxWidth="xl">
        <Card sx={{p: 1}}>
            <Box sx={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                <ToggleButton sx={{mx: 1}}
                              value="recording"
                              selected={recording}
                              onChange={() => handleRecording()}
                              color={"primary"}
                >
                    <FiberManualRecord/>
                </ToggleButton>

                <OutlinedInput sx={{mx: 1}}
                               id="outlined-basic"
                               value={label}
                               disabled={!recording}
                               onChange={(e) => setLabel(e.target.value)}
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
                <Box sx={{flexGrow: 1}}></Box>
                <IconButton>
                    <Close onClick={handleClose}/>
                </IconButton>
            </Box>
        </Card>
    </Container></Box>
}