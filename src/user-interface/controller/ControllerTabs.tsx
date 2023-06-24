import React from "react";
import { Box, Tab, Tabs } from "@mui/material";
import { VisualizerDirectory, VisualizerInfo } from "../../visualizers/VisualizerDirectory";
import {useTranslation} from "react-i18next";

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
    const [t] = useTranslation();
    return (
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs value={selectedPanel} onChange={onTabChange}>
                <Tab key={"preprocessing"} label={t("pre.tabName")}></Tab>
                {visualizers.visualizers.map((v: VisualizerInfo) => {
                    return <Tab key={v.label} label={t(v.label)}></Tab>;
                })}
            </Tabs>
        </Box>
    );
};
