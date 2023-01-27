import React, {useEffect, useMemo, useState} from "react"
import {InputData} from "../../link/ScreenLink";
import {VisualizerCanvas} from "./VisualizerCanvas";
import {Subject} from "rxjs";
import {Box} from "@mui/material";
import {Register} from "../../neurosity-adapter/Register";

export function visualizerLoader() {
    return null;
}

const FramePeriod = 1000 / 60;

export default function Visualizer() {
    const receiver = useMemo(() => Register.screenLinkReceiver, []);
    const data$ = useMemo(() => new Subject<InputData>(), []);
    const [visualizerKey, setVisualizerKey] = useState<string>();

    useEffect(() => {
        const interval = setInterval(() => {
            const data = receiver.getData();
            if (data != null) {
                if (data.visualizerLabel !== visualizerKey) {
                    setVisualizerKey(data.visualizerLabel);
                    data$.next(data);
                }
            }
        }, FramePeriod);


        return () => clearInterval(interval);
    });


    return (
        <Box>
            {visualizerKey}
            <VisualizerCanvas key={visualizerKey} data$={data$}/>
        </Box>

    );
}