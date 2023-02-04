import React from "react";
import {Box} from "@mui/material";
import {DataSourceInfos, KeysOfNeurosityData, NeurosityDataKeys} from "../../neurosity-adapter/NeurosityDataSource";
import {PreProcessPanel} from "./PreProcessPanel";
import {NeurosityDataProcessor} from "../../neurosity-adapter/NeurosityDataProcessor";

export interface PreProcessPanelProps {
    processor: NeurosityDataProcessor;
}


export function PreProcessGroup({processor}: PreProcessPanelProps) {

    return <Box sx={{display: "flex", flexWrap: "wrap"}}>
        {
            NeurosityDataKeys.map((key) => {
                return <Box sx={{width: 240}} key={key}>
                    <PreProcessPanel processor={processor} dataKey={key} key={key}
                                     outputInfo={DataSourceInfos[key as KeysOfNeurosityData]}></PreProcessPanel>
                </Box>;
            })
        }
    </Box>

}
