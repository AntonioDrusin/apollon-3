import React from "react";
import {Box, Card} from "@mui/material";
import {DataSourceNames, KeysOfNeurosityData, NeurosityDataSource} from "../../neurosity-adapter/NeurosityDataSource";
import {PreviewMeter} from "./PreviewMeter";


interface PreviewCardProps {
    dataSource: NeurosityDataSource;
}

export function PreviewCard({dataSource}: PreviewCardProps) {

    return <Card>
        <Box sx={{display: 'flex', flexWrap: 'wrap', p: 1, m: 1}}>
            {
                Object.keys(DataSourceNames).map((key) => {
                    return <PreviewMeter key={key} valueId={key as KeysOfNeurosityData} dataSource={dataSource}></PreviewMeter>;
                })
            }
        </Box>
    </Card>

}