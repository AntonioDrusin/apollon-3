import React, {useEffect, useMemo, useRef} from "react";
import {Register} from "../../Register";

export function visualizerLoader() {
    return null;
}

export function VisualizerCanvas() {
    const containerRef = useRef<HTMLDivElement>(null);
    const receiver = useMemo(() => Register.screenLinkReceiver, []);
    const refWidth = useRef(1920);
    const refHeight = useRef(1080);

    useEffect(() => {
        receiver.linkVisualizer(refWidth.current, refHeight.current, containerRef.current!);
    }, [receiver, containerRef]);

    return <div ref={containerRef} style={{width: "100%", height: "100%"}}></div>
}