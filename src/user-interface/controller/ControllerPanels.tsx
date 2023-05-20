import React from "react";
import { TabPanel } from "./TabPanel";
import { InputSettingsGroup } from "./InputSettings/InputSettingsGroup";
import { VisualizerInfo } from "../../visualizers/VisualizerDirectory";
import {PreProcessGroup} from "./PreProcessing/PreProcessGroup";

interface ControllerPanelsProps {
    selectedPanel: number;
    visualizers: VisualizerInfo[];
    dataProcessor: any; // Replace 'any' with the actual type of dataProcessor
    liveVisualizer: string | null;
    handleLiveChange: (key: string) => void;
}

export const ControllerPanels: React.FC<ControllerPanelsProps> = ({
                                                                      selectedPanel,
                                                                      visualizers,
                                                                      dataProcessor,
                                                                      liveVisualizer,
                                                                      handleLiveChange,
                                                                  }) => {
    return (
        <>
            <TabPanel value={selectedPanel} index={0}>
                <PreProcessGroup processor={dataProcessor}></PreProcessGroup>
            </TabPanel>
            {visualizers.map((v: VisualizerInfo, i: number) => {
                return (
                    <TabPanel key={v.label + "panel"} value={selectedPanel} index={i + 1}>
                        <InputSettingsGroup
                            key={v.label + "visualization-panel"}
                            visualizerInfo={v}
                            live={v.label === liveVisualizer}
                            mapKey={v.label}
                            onLive={handleLiveChange}
                        ></InputSettingsGroup>
                    </TabPanel>
                );
            })}
        </>
    );
};
