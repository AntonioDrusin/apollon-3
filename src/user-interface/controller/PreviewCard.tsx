import React from "react";
import {Box, Card} from "@mui/material";
import {DataSourceInfos, KeysOfNeurosityData, NeurosityData} from "../../neurosity-adapter/NeurosityDataSource";
import {PreviewMeter} from "./PreviewMeter";
import {Observable} from "rxjs";

interface PreviewCardProps {
    dataSource: Observable<NeurosityData>;
}

export function PreviewCard({dataSource}: PreviewCardProps) {

    return <Card>

        <Box sx={{display: "flex", flexWrap: "wrap", p: 1, m: 1}}>
            {
                Object.keys(DataSourceInfos).map((key) => {
                    return <PreviewMeter key={key} valueId={key as KeysOfNeurosityData} dataSource={dataSource} color={DataSourceInfos[key as KeysOfNeurosityData].color}></PreviewMeter>;
                })
            }
        </Box>
    </Card>

}