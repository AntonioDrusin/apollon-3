import React from "react";
import {Box} from "@mui/material";
import {DataSourceInfos, KeysOfNeurosityData, NeurosityDataSource} from "../../neurosity-adapter/NeurosityDataSource";
import {MiniGraph} from "./MiniGraph";
import {useDrag} from "react-dnd";

interface PreviewMeterProps {
    dataSource: NeurosityDataSource;
    valueId: KeysOfNeurosityData;
    color: string;
}

export function PreviewMeter({dataSource, valueId, color}: PreviewMeterProps) {
    const label = DataSourceInfos[valueId].name;

    const[{opacity}, dragRef] = useDrag(()=> ({
        type: "card",
        item: {key: valueId},
        collect: (monitor) => ({
            opacity: monitor.isDragging() ? 0.5 : 1
        })
    }), []);

    return <Box ref={dragRef}
        sx={{
            p: 1,
            m: 1,
            opacity: opacity,
            bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#101010' : 'grey.100'),
            color: (theme) => (theme.palette.mode === 'dark' ? 'grey.300' : 'grey.800'),
            border: '1px solid',
            borderColor: (theme) =>
                theme.palette.mode === 'dark' ? 'grey.800' : 'grey.300',
            borderRadius: 2,
            fontSize: '0.875rem',
            fontWeight: '400',
            display: 'flex',
            flexDirection: 'column',
            flexWrap: 'wrap'
        }}
    >
        <Box>{label}</Box>
        <MiniGraph width={120} height={32} valueId={valueId} dataSource={dataSource.data$} color={color}></MiniGraph>
    </Box>
}