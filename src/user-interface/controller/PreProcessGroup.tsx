import React from "react";
import {Box} from "@mui/material";
import {DataSourceInfos, KeysOfNeurosityData, NeurosityDataKeys} from "../../neurosity-adapter/NeurosityDataSource";
import {PreProcessOutput} from "./PreProcessOutput";
import {NeurosityDataProcessor} from "../../neurosity-adapter/NeurosityDataProcessor";

export interface PreProcessPanelProps {
    processor: NeurosityDataProcessor;
}


export function PreProcessGroup({processor}: PreProcessPanelProps) {

    return <Box>
        {
            <Box sx={{display: 'flex', flexWrap: 'wrap'}}>
                {
                    NeurosityDataKeys.map((key) => {
                        return <Box sx={{width: 240}} key={key}>
                            <PreProcessOutput processor={processor} dataKey={key} key={key}
                                              outputInfo={DataSourceInfos[key as KeysOfNeurosityData]}></PreProcessOutput>
                        </Box>;
                    })
                }
            </Box>
        }
    </Box>
}
