import React, {useEffect, useState} from "react";
import {Box, Card} from "@mui/material";
import {DataSourceInfos, KeysOfNeurosityData, NeurosityDataSource} from "../../neurosity-adapter/NeurosityDataSource";
import {MiniGraph} from "./MiniGraph";
import {useDrag} from "react-dnd";

interface PreviewMeterProps {
    dataSource: NeurosityDataSource;
    valueId: KeysOfNeurosityData;
    color: string;
}

export function PreviewMeter({dataSource, valueId, color}: PreviewMeterProps) {
    const [value, setValue] = useState<number>(0);
    const label = DataSourceInfos[valueId].name;

    const[{opacity}, dragRef] = useDrag(()=> ({
        type: "card",
        item: {key: valueId},
        collect: (monitor) => ({
            opacity: monitor.isDragging() ? 0.5 : 1
        })
    }), []);

    useEffect(() => {
        const subscription = dataSource.data$.subscribe((data) => {
            setValue(data[valueId]);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [dataSource]);


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
            fontWeight: '700',
            display: 'flex',
            flexDirection: 'column',
            flexWrap: 'wrap'
        }}
    >
        <Box>{label}</Box>
        <MiniGraph valueId={valueId} dataSource={dataSource} color={color}></MiniGraph>
    </Box>
}