import {
    AppBar,
    Box, Button,
    Container, IconButton, Menu, MenuItem,
    Snackbar, Tab, Tabs,
    Toolbar,
    Typography
} from "@mui/material";
import {PersonalVideo} from "@mui/icons-material";
import React, {useState, useEffect} from "react";
import LoginDialog from "./LoginDialog";
import {HeadsetStatus} from "./HeadsetStatus";
import {DeviceInfo} from "@neurosity/sdk/dist/cjs/types/deviceInfo";
import {NeurosityAdapter} from "../../neurosity-adapter/NeurosityAdapter";
import {PreviewCard} from "./PreviewCard";
import {DndProvider} from "react-dnd";
import {HTML5Backend} from "react-dnd-html5-backend"
import {VisualizerDirectory, VisualizerInfo} from "../../visualizers/Visualizers";
import {VisualizerPanel} from "./VisualizerPanel";
import {PreProcessGroup} from "./PreProcessGroup";
import {TabPanel} from "./TabPanel";
import {ParameterMap, ParameterMaps, ScreenLink} from "../../link/ScreenLink";

export function controllerLoader() {
    return null;
}

export default function Controller() {
    const DISCONNECTED = "Disconnected";
    const [dataSource, setDataSource] = useState(DISCONNECTED)
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [headsets, setHeadsets] = useState<DeviceInfo[]>([]);
    const [headset, setHeadset] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [visualizers] = useState(() => new VisualizerDirectory());
    const [selectedPanel, setSelectedPanel] = useState(0);
    const [liveVisualizer, setLiveVisualizer] = useState<string | null>(null);
    const [screenLink] = useState(() => ScreenLink.instance());
    const [maps, setMaps] = useState<ParameterMaps>();

    const [neurosity] = useState(() => new NeurosityAdapter());

    useEffect(() => {
        const devicesSub = neurosity.devices$.subscribe(setHeadsets);
        const loggedInSub = neurosity.loggedIn$.subscribe((loggedIn) => {
            setDataSource(loggedIn ? "Connected" : "Disconnected");
        })
        const deviceSub = neurosity.selectedDevice$.subscribe((device) => {
            setHeadset(device?.deviceNickname ?? null);
        });

        return () => {
            devicesSub.unsubscribe();
            loggedInSub.unsubscribe();
            deviceSub.unsubscribe();
        };
    }, [neurosity]);

    useEffect(() => {
        setMaps(screenLink.getMaps());
    }, [screenLink]);

    const menuButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
        setMenuOpen(true);
    };
    const handleMenuClose = () => {
        setMenuOpen(false);
    };

    const [dialogOpen, setDialogOpen] = React.useState(false);
    const closeDialog = () => {
        setDialogOpen(false);
    };

    const openDialog = () => {
        handleMenuClose();
        setDialogOpen(true);
    };

    const logOut = () => {
        neurosity.logOut();
        handleMenuClose();
    };

    const selectDevice = (deviceId: string) => {
        neurosity.selectDevice(deviceId);
        handleMenuClose();
    }

    const handleLiveChange = (key: string) => {
        if (key !== liveVisualizer) {
            setLiveVisualizer(key);
        } else setLiveVisualizer(null);
    }

    const errorClose = () => {
        setError(null);
    };

    const handleParameterChange = (key: string, map: ParameterMap) => {
        console.log("Handle param change");
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

    return (
        <Box>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
                        Apollon 3
                    </Typography>
                    <Box sx={{mx: 4}}>
                        <HeadsetStatus neurosity={neurosity} headset={headset}></HeadsetStatus>
                    </Box>
                    <Button
                        variant="outlined"
                        onClick={menuButtonClick}
                    >{dataSource}</Button>
                    <Box sx={{mx: 4}}>
                        <IconButton onClick={() => {
                            window.open(window.location.pathname + '#/visualizer', '_blank');
                        }}>
                            <PersonalVideo></PersonalVideo>
                        </IconButton>
                    </Box>
                </Toolbar>
                <Menu
                    anchorEl={anchorEl}
                    open={menuOpen}
                    onClose={() => handleMenuClose()}
                >
                    {
                        headsets.map((headset) => {
                            return <MenuItem key={headset.deviceId}
                                             onClick={() => selectDevice(headset.deviceId)}>{headset.deviceNickname}</MenuItem>;
                        })
                    }
                    <MenuItem divider={true} hidden={!headsets || headsets.length === 0} disabled={true}/>
                    <MenuItem onClick={openDialog}>Login</MenuItem>
                    <MenuItem onClick={logOut}>Log out</MenuItem>
                </Menu>

                <LoginDialog open={dialogOpen} onClose={closeDialog} neurosity={neurosity}></LoginDialog>


            </AppBar>
            <DndProvider backend={HTML5Backend}>
                <Container maxWidth="xl">
                    <Box sx={{p: 1, m: 1}}>
                        <PreviewCard dataSource={neurosity.processor.data$}></PreviewCard>
                    </Box>
                </Container>
                <Container maxWidth="xl">
                    <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
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
                        <PreProcessGroup processor={neurosity.processor}></PreProcessGroup>
                    </TabPanel>

                    {maps &&
                        visualizers.visualizers.map((v: VisualizerInfo, i: number) => {
                            return <TabPanel key={v.label + 'panel'} value={selectedPanel} index={i + 1}>
                                <VisualizerPanel
                                    key={v.label + 'vizpanel'}
                                    visualizerInfo={v}
                                    live={v.label === liveVisualizer}
                                    onLive={handleLiveChange}
                                    onParameterChange={(map: ParameterMap) => handleParameterChange(v.label, map)}
                                    map={maps[v.label]}
                                ></VisualizerPanel>
                            </TabPanel>;
                        })
                    }
                </Container>
            </DndProvider>
            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={errorClose}
                message={error}
            />
        </Box>
    );
}