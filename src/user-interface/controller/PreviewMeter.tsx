import React, {useEffect, useState} from "react";
import {Box, Card} from "@mui/material";
import {DataSourceNames, KeysOfNeurosityData, NeurosityDataSource} from "../../neurosity-adapter/NeurosityDataSource";

interface PreviewMeterProps {
    dataSource: NeurosityDataSource;
    valueId: KeysOfNeurosityData;
}

export function PreviewMeter({dataSource, valueId}: PreviewMeterProps) {
    const [value, setValue] = useState<number>(0);

    const label = DataSourceNames[valueId];

    useEffect(() => {
        const subscription = dataSource.data$.subscribe((data) => {
            setValue(data[valueId]);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [dataSource]);


    return <Box
        sx={{
            p: 1,
            m: 1,
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
        <Box>{value.toFixed(1)}</Box>
    </Box>
}