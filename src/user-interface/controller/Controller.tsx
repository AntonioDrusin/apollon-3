import {
    AppBar,
    Box,
    Button,
    Toolbar,
    Typography
} from "@mui/material";
import {PersonalVideo, ResetTv} from "@mui/icons-material";
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
import ContextProvider from "./ContextProvider/ContextProvider";
import PauseButton from "./PauseButton";
import {VisualizerDirectory} from "../../visualizers/VisualizerDirectory";
import {ControllerTabs} from "./ControllerTabs";
import {ControllerPanels} from "./ControllerPanels";

export function controllerLoader() {
    return null;
}

export default function Controller() {
    const [headset, setHeadset] = useState<string | null>(null);
    const [visualizerWindow, setVisualizerWindow] = useState<Window | null>(null);
    const neurosityAdapter = useMemo(() => Register.neurosityAdapter, []);
    const dataProcessor = useMemo(() => Register.dataProcessor, []);
    const screenLink = useMemo(() => Register.screenLink, []);
    const [selectedPanel, setSelectedPanel] = useState(0);
    const [visualizers] = useState(() => new VisualizerDirectory());
    const [liveVisualizer, setLiveVisualizer] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const deviceSub = neurosityAdapter.selectedDevice$.subscribe((device) => {
            setHeadset(device?.deviceNickname ?? null);
        });

        return () => {
            deviceSub.unsubscribe();
        };
    }, [neurosityAdapter]);

    const handleLiveChange = (key: string) => {
        if (key !== liveVisualizer) {
            setLiveVisualizer(key);
        } else {
            setLiveVisualizer(null);
        }
    };

    useEffect(() => {
        if (!loading) {
            screenLink.setVisualizer(liveVisualizer);
        }
    }, [loading, screenLink, liveVisualizer]);

    useEffect(() => {
        setLiveVisualizer(screenLink.getVisualizer());
        setLoading(false);
    }, [screenLink]);

    const onTabChange = (event: React.SyntheticEvent, newValue: any) => setSelectedPanel(newValue);

    return (
        <>
            <ContextProvider>
                <DndProvider backend={HTML5Backend}>
                    <Box sx={{display: "flex", flexDirection: "column", height: "100vh"}}>
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
                                    <Button variant="outlined" onClick={() => {
                                        screenLink.reset();
                                        setVisualizerWindow(window.open(window.location.pathname + "#/visualizer", "_blank"));
                                    }}>
                                        <PersonalVideo color="inherit"></PersonalVideo>
                                    </Button>
                                    <PauseButton/>
                                    <Button variant="outlined" onClick={() => {
                                        screenLink.reset();
                                        visualizerWindow?.location.reload();
                                    }}><ResetTv></ResetTv></Button>
                                </Box>

                            </Toolbar>
                        </AppBar>
                        <FilePlaybackBar></FilePlaybackBar>
                        <RecordingBar></RecordingBar>
                        <Box>
                            <Box sx={{p: 1, m: 1}}>
                                <PreviewCard dataSource={dataProcessor.data$}></PreviewCard>
                            </Box>
                        </Box>
                        {loading ? null : (
                            <ControllerTabs
                                selectedPanel={selectedPanel}
                                onTabChange={onTabChange}
                                visualizers={visualizers}
                                dataProcessor={dataProcessor}
                                liveVisualizer={liveVisualizer}
                                handleLiveChange={handleLiveChange}
                            />
                        )}
                        <Box sx={{flex: 1, overflowY: "scroll"}}>
                        <ControllerPanels
                            selectedPanel={selectedPanel}
                            visualizers={visualizers.visualizers}
                            dataProcessor={dataProcessor}
                            liveVisualizer={liveVisualizer}
                            handleLiveChange={handleLiveChange}
                        />
                        </Box>
                        <MultiSnackBar></MultiSnackBar>
                    </Box>
                </DndProvider>
            </ContextProvider>
        </>
    );
}