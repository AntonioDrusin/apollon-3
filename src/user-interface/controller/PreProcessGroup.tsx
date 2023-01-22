import React from "react";
import {Box} from "@mui/material";
import {DataSourceInfos, KeysOfNeurosityData, NeurosityDataKeys} from "../../neurosity-adapter/NeurosityDataSource";
import {PreProcessOutput} from "./PreProcessOutput";
import {NeurosityDataProcessor} from "../../neurosity-adapter/NeurosityDataProcessor";

export interface PreProcessPanelProps {
    value: number;
    index: number;
    processor: NeurosityDataProcessor;
}


export function PreProcessGroup({index, value, processor}: PreProcessPanelProps) {

    return <div
        role="tabpanel"
        id={`simple-tabpanel-${index}`}
    >
        {value === index && (
            <Box sx={{display: 'flex', flexWrap: 'wrap'}}>
                {
                    NeurosityDataKeys.map((key) => {
                        return <Box sx={{width:320}} key={key}>
                            <PreProcessOutput processor={processor} dataKey={key} key={key} outputInfo={DataSourceInfos[key as KeysOfNeurosityData]}></PreProcessOutput>
                        </Box>;
                    })
                }
            </Box>
        )}
    </div>
}
