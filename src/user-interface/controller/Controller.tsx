import {
    AppBar,
    Box,
    Container,
    IconButton,
    Tab,
    Tabs,
    Toolbar,
    Typography
} from "@mui/material";
import {PersonalVideo} from "@mui/icons-material";
import React, {useState, useEffect, useMemo} from "react";
import {HeadsetStatus} from "./HeadsetStatus";
import {PreviewCard} from "./PreviewCard";
import {DndProvider} from "react-dnd";
import {HTML5Backend} from "react-dnd-html5-backend"
import {VisualizerDirectory, VisualizerInfo} from "../../visualizers/VisualizerDirectory";
import {PreProcessGroup} from "./PreProcessing/PreProcessGroup";
import {TabPanel} from "./TabPanel";
import {ParameterMap, ParameterMaps} from "../../link/ScreenLink";
import {Register} from "../../Register";
import MainMenu from "../MainMenu";
import {InputSettingsGroup} from "./InputSettings/InputSettingsGroup";
import {LayoutContext} from "./LayoutContext";
import RecordingBar from "./RecordingBar";
import MultiSnackBar from "./MultiSnackBar";
import ConnectionMenu from "./ConnectionMenu";

export function controllerLoader() {
    return null;
}

export default function Controller() {
    const [headset, setHeadset] = useState<string | null>(null);
    const [visualizers] = useState(() => new VisualizerDirectory());
    const [selectedPanel, setSelectedPanel] = useState(0);
    const [liveVisualizer, setLiveVisualizer] = useState<string | null>(null);
    const [screenLink] = useState(() => Register.screenLink);
    const [maps, setMaps] = useState<ParameterMaps>();
    const [recordingBar, setRecordingBar] = useState(true);

    const neurosityAdapter = useMemo(() => Register.neurosityAdapter, []);
    const dataProcessor = useMemo(() => Register.dataProcessor, []);
    const [loading, setLoading] = useState<boolean>(true);
    const [snackMessage, setSnackMessage] = useState<string>();


    useEffect(() => {
        const deviceSub = neurosityAdapter.selectedDevice$.subscribe((device) => {
            setHeadset(device?.deviceNickname ?? null);
        });

        return () => {
            deviceSub.unsubscribe();
        };
    }, [neurosityAdapter]);

    useEffect(() => {
        setMaps(screenLink.getMaps());
    }, [screenLink]);


    const handleLiveChange = (key: string) => {
        if (key !== liveVisualizer) {
            setLiveVisualizer(key);
        } else setLiveVisualizer(null);
    }

    useEffect(() => {
        if (!loading) {
            screenLink.setVisualizer(liveVisualizer);
        }
    }, [loading, screenLink, liveVisualizer]);


    useEffect(() => {
        setMaps(screenLink.getMaps());
        setLiveVisualizer(screenLink.getVisualizer());
        setLoading(false);
    }, [screenLink]);

    const handleParameterChange = (key: string, map: ParameterMap) => {
        if (maps) {
            const newMaps: ParameterMaps = maps;
            newMaps[key] = map;
            setMaps(newMaps);
            // If I use an effect of maps to set this, it no longer refreshes.
            // If I make a clone, then it goes in an infinite loop
            screenLink.setMaps(newMaps);
        }
    }

    const onTabChange = (event: React.SyntheticEvent, newValue: any) => setSelectedPanel(newValue);

    return loading ? null : (
        <Box>
            <LayoutContext.Provider value={{recordingBar, setRecordingBar, setSnackMessage}}>
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
                <RecordingBar hidden={!recordingBar}></RecordingBar>
                <Container maxWidth="xl">
                    <Box sx={{borderBottom: 1, borderColor: "divider"}}>
                        <Tabs value={selectedPanel} onChange={onTabChange}>
                            <Tab key={"preprocessing"} label={"Preprocessing"}></Tab>
                            {
                                visualizers.visualizers.map((v: VisualizerInfo) => {
                                    return <Tab key={v.label} label={v.label}></Tab>;
                                })
                            }
                        </Tabs>
                    </Box>

                    <TabPanel value={selectedPanel} index={0}>
                        <PreProcessGroup processor={dataProcessor}></PreProcessGroup>
                    </TabPanel>

                    {maps &&
                        visualizers.visualizers.map((v: VisualizerInfo, i: number) => {
                            return <TabPanel key={v.label + "panel"} value={selectedPanel} index={i + 1}>
                                <InputSettingsGroup
                                    key={v.label + "visualization-panel"}
                                    visualizerInfo={v}
                                    live={v.label === liveVisualizer}
                                    onLive={handleLiveChange}
                                    onParameterChange={(map: ParameterMap) => handleParameterChange(v.label, map)}
                                    map={maps[v.label]}
                                ></InputSettingsGroup>
                            </TabPanel>
                                ;
                        })
                    }
                </Container>
            </DndProvider>
            <MultiSnackBar message={snackMessage}></MultiSnackBar>
            </LayoutContext.Provider>
        </Box>
    );
}