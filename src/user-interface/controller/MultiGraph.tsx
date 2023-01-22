import React, {useEffect, useRef, useState} from "react";
import Sketch from "react-p5";
import type P5 from "p5";
import {KeysOfNeurosityData, NeurosityData} from "../../neurosity-adapter/NeurosityDataSource";
import {Observable} from "rxjs";

interface MultiGraphProps {
    valueId: string;
    dataSource: Observable<NeurosityData>;
    color: string;
    width: number;
    height: number;
    minPlot: number;
    maxPlot: number;
}

export function MultiGraph({valueId, dataSource, color, width, height, minPlot, maxPlot}: MultiGraphProps) {
    const periodMs = 16.3;
    const samples = 450;
    let value = useRef(0)

    const [values] = useState(() => {
        let ary = new Array(samples);
        ary.fill(0);
        return ary;
    });

    useEffect(() => {
        const interval = setInterval(() => {
            const l = values.push(value.current);
            if (l > samples) values.shift();
        }, periodMs);

        return () => clearInterval(interval);
    });

    useEffect(() => {
        const sub = dataSource.subscribe((data: NeurosityData) => {
                value.current = data[valueId as KeysOfNeurosityData];
            }
        );
        return () => sub.unsubscribe();
    }, [dataSource, valueId]);

    const setup = (p5: P5, canvasParentRef: Element) => {
        p5.createCanvas(width, height).parent(canvasParentRef)
    }

    const draw = (p5: P5) => {
        p5.background(0, 0, 0);
        p5.fill(color);
        p5.stroke(73, 55, 138);
        p5.strokeWeight(1);

//        const min = Math.min.apply(null, values);
        //const max = Math.max.apply(null, values);
        const yScale = height / (maxPlot - minPlot);
        const xScale = width / (samples - 1);

        p5.beginShape();
        p5.vertex(0, height);
        values.forEach((value, index) => p5.vertex(index * xScale, height - (value - minPlot) * yScale));
        p5.vertex(width, height);
        p5.endShape('close');

        p5.fill(208, 199, 240);
        p5.noStroke();
    };

    return <Sketch setup={setup} draw={draw}></Sketch>


}