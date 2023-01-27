import React, {useEffect, useRef} from "react";
import Sketch from "react-p5";
import {InputData} from "../../link/ScreenLink";
import P5 from "p5";
import {Observable} from "rxjs";

interface VisualizerCanvasProps {
    data$: Observable<InputData>;
}

export function VisualizerCanvas({data$}: VisualizerCanvasProps) {

    let value = useRef<InputData>();

    const setup = (p5: P5, canvasParentRef: Element) => {
        p5.createCanvas(p5.windowWidth, p5.windowHeight).parent(canvasParentRef)
    }

    const draw = (p5: P5) => {
        p5.background(0, 0, 100);
    }

    useEffect(() => {
        const sub = data$.subscribe((data: InputData) => {
                value.current = data;
            }
        );
        return () => sub.unsubscribe();
    }, [data$]);


    return <Sketch setup={setup} draw={draw}></Sketch>
}