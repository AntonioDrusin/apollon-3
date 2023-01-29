import React, {useEffect, useMemo, useRef} from "react";
import Sketch from "react-p5";
import {InputData} from "../../link/ScreenLink";
import P5 from "p5";
import {Observable} from "rxjs";
import {Register} from "../../Register";

interface VisualizerCanvasProps {
    data$: Observable<InputData>;
}

let drawData: InputData | null = null;

export function VisualizerCanvas({data$}: VisualizerCanvasProps) {
    const receiver = useMemo(() => Register.screenLinkReceiver, []);
    const refWidth = useRef(0);
    const refHeight = useRef(0);

    useEffect(() => {
        const sub = data$.subscribe((data: InputData) => {
                drawData = data;
            }
        );
        return () => sub.unsubscribe();
    }, [data$]);

    const setup = (p5: P5, canvasParentRef: Element) => {
        p5.createCanvas(p5.windowWidth, p5.windowHeight).parent(canvasParentRef)
        refWidth.current = p5.windowWidth;
        refHeight.current = p5.windowHeight;
    }

    const draw = (p5: P5) => {
        const data = drawData;
        if (data && data.visualizerLabel != null) {
            const visualizer = receiver.getVisualizer(data.visualizerLabel);
            receiver.setVisualizerParameters(visualizer, data);
            // set the parameters

            visualizer.paint(refWidth.current, refHeight.current, p5);
        } else {
            p5.background(0, 0, 100);
        }
    }

    return <Sketch setup={setup} draw={draw}></Sketch>
}