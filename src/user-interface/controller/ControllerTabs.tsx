import React from "react";
import { Box, Tab, Tabs } from "@mui/material";
import { VisualizerDirectory, VisualizerInfo } from "../../visualizers/VisualizerDirectory";
import { TabPanel } from "./TabPanel";
import { PreProcessGroup } from "./PreProcessing/PreProcessGroup";
import { InputSettingsGroup } from "./InputSettings/InputSettingsGroup";
import { Register } from "../../Register";

interface ControllerTabsProps {
    selectedPanel: number;
    onTabChange: (event: React.SyntheticEvent, newValue: any) => void;
    visualizers: VisualizerDirectory;
    dataProcessor: any; // Replace 'any' with the actual type of dataProcessor
    liveVisualizer: string | null;
    handleLiveChange: (key: string) => void;
}

export const ControllerTabs: React.FC<ControllerTabsProps> = ({
                                                                  selectedPanel,
                                                                  onTabChange,
                                                                  visualizers,
                                                                  dataProcessor,
                                                                  liveVisualizer,
                                                                  handleLiveChange,
                                                              }) => {
    return (
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs value={selectedPanel} onChange={onTabChange}>
                <Tab key={"preprocessing"} label={"Preprocessing"}></Tab>
                {visualizers.visualizers.map((v: VisualizerInfo) => {
                    return <Tab key={v.label} label={v.label}></Tab>;
                })}
            </Tabs>
        </Box>
    );
};
