import {Box} from "@mui/material";
import {AutoGraph} from "@mui/icons-material";
import Typography from "@mui/material/Typography";
import React, {memo, useEffect, useMemo, useState} from "react";
import {Register} from "../../Register";
import {BrainwaveNames} from "../../neurosity-adapter/OutputDataSource";
import _ from "lodash"

const qualityColorMap: any = {
  good: "yellow",
  great: "green",
  bad: "red",
  noContact: "gray"
};

interface QualitySensorProps{
    color: string;
    name: string;
}

const QualitySensor = memo(({color, name}: QualitySensorProps) => {
    return <Typography variant="h6" component="span" sx={{color: color, marginRight: 1}}>{name}</Typography>
});

export default function HeadsetQuality() {
    const neurosity = useMemo(() => Register.neurosityAdapter, []);
    const [quality, setQuality] = useState<[]>([]);

    useEffect(() => {
        const sub = neurosity.signalQuality$.subscribe((signalQuality) => {
            const newQuality = (signalQuality as any).map((v: any, i: number) => ({
                name: BrainwaveNames[i],
                color: qualityColorMap[v.status],
            }))
            if ( !_.isEqual(quality, newQuality)) {
                setQuality(newQuality);
            }
        });
        return () => {
            sub.unsubscribe();
        };
    }, [neurosity]);


    return <>
         <Box sx={{verticalAlign: "middle", mx: 1}} component="span">
                        <AutoGraph/>
                    </Box>
        {
            quality.map((q: any) => {
                return <QualitySensor key={"headset-quality-"+q.name} color={q.color} name={q.name}/>
            })
        }
    </>
}