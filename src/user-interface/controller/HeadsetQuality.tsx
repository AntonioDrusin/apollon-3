import {Box} from "@mui/material";
import {AutoGraph} from "@mui/icons-material";
import Typography from "@mui/material/Typography";
import React, {useEffect, useMemo, useState} from "react";
import {Register} from "../../Register";
import {BrainwaveNames} from "../../neurosity-adapter/OutputDataSource";

const qualityColorMap: any = {
  good: "yellow",
  great: "green",
  bad: "red",
  noContact: "gray"
};
export default function HeadsetQuality() {
    const neurosity = useMemo(() => Register.neurosityAdapter, []);
    const [quality, setQuality] = useState<[]>([]);

    useEffect(() => {
        const sub = neurosity.signalQuality$.subscribe((signalQuality) => {
            const quality = (signalQuality as any).map((v: any, i: number) => ({
                name: BrainwaveNames[i],
                color: qualityColorMap[v.status],
            }))
            setQuality(quality);
        });
        return () => {
            sub.unsubscribe();
        };
    }, [neurosity]);


    return <span>
         <Box sx={{verticalAlign: "middle", marginLeft: 1}} component="span">
                        <AutoGraph/>
                    </Box>
        {
            quality.map((q: any) => {
                return <Typography variant="h6" component="span" sx={{color: q.color, mx: 1}}>{q.name}</Typography>
            })
        }
    </span>
}