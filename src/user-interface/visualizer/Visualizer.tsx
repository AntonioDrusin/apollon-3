import "./Visualizer.css"

import React, {useEffect, useState} from "react"
import {LinkData, ScreenLink} from "../../link/ScreenLink";
import {VisualizerCanvas} from "./VisualizerCanvas";
import {BehaviorSubject, Observable, Subject} from "rxjs";
import {Box} from "@mui/material";

export function visualizerLoader() {
    return null;
}

const FramePeriod = 1000 / 60;

export default function Visualizer() {
    const [link] = useState<ScreenLink>(() => ScreenLink.instance());
    const [visualizerKey, setVisualizerKey] = useState<string>();
    const [data$] = useState<Subject<LinkData>>( () => new Subject<LinkData>());

    useEffect(() => {
        const interval = setInterval(() => {
            const data = link.getData();
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