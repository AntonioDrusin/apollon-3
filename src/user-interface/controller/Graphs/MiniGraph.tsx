import React, {useContext, useEffect, useRef, useState} from "react";
import Sketch from "react-p5";
import type P5 from "p5";
import {KeysOfNeurosityData, NeurosityData} from "../../../neurosity-adapter/OutputDataSource";
import {Observable} from "rxjs";
import {getThemeByName, ThemeContext} from "../../../App";

interface MiniGraphProps {
    valueId: string;
    dataSource: Observable<NeurosityData>;
    color: string;
    width: number;
    height: number;
}

export function MiniGraph({valueId, dataSource, color, width, height}: MiniGraphProps) {
    const periodMs = 1000/120;
    const samples = width;
    const margin = 8;
    let value = useRef(0)
    const themeContext = useContext(ThemeContext);
    const theme = getThemeByName(themeContext.themeName);

    const [values] = useState<number[]>(() => {
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
        const sub = dataSource.subscribe((data) => {
                value.current = data[valueId as KeysOfNeurosityData];
            }
        );
        return () => sub.unsubscribe();
    }, [dataSource, valueId]);

    const setup = (p5: P5, canvasParentRef: Element) => {
        p5.createCanvas(width, height).parent(canvasParentRef)
    }

    const draw = (p5: P5) => {
        p5.background(theme.palette.background.default);

        p5.stroke(theme.palette.primary.main);
        p5.fill(theme.palette.background.paper);
        p5.strokeWeight(1);

        const min = Math.min.apply(null, values);
        const max = Math.max.apply(null, values);
        const yScale = height /(max-min);
        const xScale = width / (samples - 1);

        p5.beginShape();
        // p5.vertex(0, height);
        values.forEach((value, index) => p5.vertex(index * xScale, height - ((value-min) * yScale)));
        // p5.vertex(width, height);
        p5.endShape();

        p5.fill(theme.palette.primary.main);
        p5.noStroke();

        p5.text(max.toFixed(1), margin, 12);
        p5.text(min.toFixed(1), margin, height - 4);

        p5.fill(theme.palette.secondary.main);
        const textWidth = p5.textWidth(values[samples - 1].toFixed(1));
        p5.text(values[samples - 1].toFixed(1), width - textWidth - margin, 12);
    };

    return <Sketch setup={setup} draw={draw}></Sketch>


}
