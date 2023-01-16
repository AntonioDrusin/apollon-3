import React from "react";
import {Box, Card} from "@mui/material";
import {DataSourceNames, KeysOfNeurosityData, NeurosityDataSource} from "../../neurosity-adapter/NeurosityDataSource";
import {PreviewMeter} from "./PreviewMeter";


interface PreviewCardProps {
    dataSource: NeurosityDataSource;
}

export function PreviewCard({dataSource}: PreviewCardProps) {

    return <Card>
        <Box sx={{display: 'flex', flexDirection: 'row', p: 1, m: 1}}>
            {
                Object.keys(DataSourceNames).map((key) => {
                    return <PreviewMeter valueId={key as KeysOfNeurosityData} dataSource={dataSource}></PreviewMeter>;
                })
            }
        </Box>
    </Card>

}