import {Box, Container, Tab, Tabs} from "@mui/material";
import {VisualizerDirectory, VisualizerInfo} from "../../visualizers/VisualizerDirectory";
import {TabPanel} from "./TabPanel";
import {PreProcessGroup} from "./PreProcessing/PreProcessGroup";
import {InputSettingsGroup} from "./InputSettings/InputSettingsGroup";
import {ParameterMap, ParameterMaps} from "../../link/ScreenLink";
import React, {useEffect, useMemo, useState} from "react";
import {Register} from "../../Register";

export default function ControllerTabs() {
    const [selectedPanel, setSelectedPanel] = useState(0);
    const [visualizers] = useState(() => new VisualizerDirectory());
    const [liveVisualizer, setLiveVisualizer] = useState<string | null>(null);
    const [screenLink] = useState(() => Register.screenLink);
    const [maps, setMaps] = useState<ParameterMaps>();
    const [loading, setLoading] = useState<boolean>(true);
    const dataProcessor = useMemo(() => Register.dataProcessor, []);

    const handleLiveChange = (key: string) => {
        if (key !== liveVisualizer) {
            setLiveVisualizer(key);
        } else setLiveVisualizer(null);
    }
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

    useEffect(() => {
        setMaps(screenLink.getMaps());
    }, [screenLink]);

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


    const onTabChange = (event: React.SyntheticEvent, newValue: any) => setSelectedPanel(newValue);


    return (loading ? null : <Container maxWidth="xl">
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
    </Container>)
}