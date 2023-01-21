import React, {useEffect, useRef, useState} from "react";
import Sketch from "react-p5";
import type P5 from "p5";
import {Box} from "@mui/material";
import {KeysOfNeurosityData, NeurosityDataSource} from "../../neurosity-adapter/NeurosityDataSource";

interface MiniGraphProps {
    valueId: string;
    dataSource: NeurosityDataSource;
    color: string;
}

export function MiniGraph({valueId, dataSource, color}: MiniGraphProps) {
    const periodMs = 250;
    const samples = 20;
    const width = 100;
    const height = 32;
    const margin = 10;
    const rightTextDelta = 20;
    let value = useRef(0)

    const [values, setValues] = useState<number[]>(() => {
        let ary = new Array(samples);
        ary.fill(0);
        return ary;
    });

    useEffect(() => {
        const interval = setInterval(() => {
            const l = values.push(value.current);
            if (l > samples) values.shift();
            setValues(values);
        }, periodMs);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const sub = dataSource.data$.subscribe( (data) => {
                value.current = data[valueId as KeysOfNeurosityData];
            }
        );
        return () => sub.unsubscribe();
    }, [dataSource]);

    const setup = (p5: P5, canvasParentRef: Element) => {
        p5.createCanvas(width, height).parent(canvasParentRef)
    }

    const draw = (p5: P5) => {
        p5.background(0, 0, 0);
        p5.fill(color);
        p5.stroke(73,55,138);
        p5.strokeWeight(1);

        const min = 0;
        const max = Math.max.apply(null, values);
        const yScale = height / max;
        const xScale = width / (samples-1);

        p5.beginShape();
        p5.vertex(0,height);
        values.forEach((value, index) => p5.vertex(index*xScale, height - value*yScale));
        p5.vertex(width,height);
        p5.endShape('close');

        p5.fill(208,199,240);
        p5.noStroke();

        p5.text(max.toFixed(1), 0, margin);

        p5.fill(208,240,199);
        p5.text(values[samples-1].toFixed(1), width-rightTextDelta, margin);
    };

    return <Box>
        <Sketch setup={setup} draw={draw}></Sketch>
    </Box>

}
