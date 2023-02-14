import {
    AppBar,
    Box,
    Container,
    IconButton,
    Toolbar,
    Typography
} from "@mui/material";
import {PersonalVideo} from "@mui/icons-material";
import React, {useState, useEffect, useMemo} from "react";
import {HeadsetStatus} from "./HeadsetStatus";
import {PreviewCard} from "./PreviewCard";
import {DndProvider} from "react-dnd";
import {HTML5Backend} from "react-dnd-html5-backend"
import {Register} from "../../Register";
import MainMenu from "../MainMenu";
import RecordingBar from "./RecordingBar/RecordingBar";
import MultiSnackBar from "./MultiSnackBar";
import ConnectionMenu from "./ConnectionMenu";
import FilePlaybackBar from "./FilePlayback/FilePlaybackBar";
import ControllerTabs from "./ControllerTabs";
import ContextProvider from "./ContextProvider/ContextProvider";

export function controllerLoader() {
    return null;
}

export default function Controller() {
    const [headset, setHeadset] = useState<string | null>(null);
    const neurosityAdapter = useMemo(() => Register.neurosityAdapter, []);
    const dataProcessor = useMemo(() => Register.dataProcessor, []);

    useEffect(() => {
        const deviceSub = neurosityAdapter.selectedDevice$.subscribe((device) => {
            setHeadset(device?.deviceNickname ?? null);
        });

        return () => {
            deviceSub.unsubscribe();
        };
    }, [neurosityAdapter]);

    return (
        <Box>
            <ContextProvider>
            <AppBar position="static">
                <Toolbar>
                    <MainMenu></MainMenu>
                    <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
                        Apollon 3
                    </Typography>
                    <Box sx={{flexGrow: 1}}></Box>
                    <Box sx={{mx: 4}}>
                        <HeadsetStatus headset={headset}></HeadsetStatus>
                    </Box>
                    <ConnectionMenu></ConnectionMenu>
                    <Box sx={{mx: 4}}>
                        <IconButton onClick={() => {
                            window.open(window.location.pathname + "#/visualizer", "_blank");
                        }}>
                            <PersonalVideo color="inherit"></PersonalVideo>
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>
            <DndProvider backend={HTML5Backend}>
                <Container maxWidth="xl" >
                    <Box sx={{p: 1, m: 1}}>
                        <PreviewCard dataSource={dataProcessor.data$}></PreviewCard>
                    </Box>
                </Container>
                <FilePlaybackBar></FilePlaybackBar>
                <RecordingBar></RecordingBar>
                <ControllerTabs></ControllerTabs>
            </DndProvider>
            <MultiSnackBar></MultiSnackBar>
            </ContextProvider>
        </Box>
    );
}