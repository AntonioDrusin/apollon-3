import React, { useRef, useEffect } from 'react';
import p5 from 'p5';

interface DataPoint {
    time: number;
    value: number;
}

interface AllGraphProps {
    data: DataPoint[];
}

export default function AllGraph ({ data }: AllGraphProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;

        if (container) {
            new p5((sketch) => {
                const width = container.offsetWidth;
                const height = container.offsetHeight;
                const padding = 50;
                const timeMin = data[0].time;
                const timeMax = data[data.length - 1].time;
                const valueMin = Math.min(...data.map((d) => d.value));
                const valueMax = Math.max(...data.map((d) => d.value));

                sketch.setup = () => {
                    sketch.createCanvas(width, height);
                    sketch.stroke(0);
                    sketch.noFill();
                    sketch.textAlign(sketch.CENTER, sketch.TOP);
                };

                sketch.draw = () => {
                    sketch.background(255);

                    // Draw x-axis
                    sketch.line(padding, height - padding, width - padding, height - padding);
                    sketch.text('Time', width / 2, height - padding / 2);

                    // Draw y-axis
                    sketch.line(padding, height - padding, padding, padding);
                    sketch.text('Value', padding / 2, height / 2);

                    // Draw data
                    sketch.beginShape();
                    data.forEach((d) => {
                        const x = sketch.map(d.time, timeMin, timeMax, padding, width - padding);
                        const y = sketch.map(d.value, valueMin, valueMax, height - padding, padding);
                        sketch.vertex(x, y);
                    });
                    sketch.endShape();

                    // Draw time labels
                    const labelInterval = 1000 * 60 * 60 * 24; // 1 day
                    for (let t = timeMin; t <= timeMax; t += labelInterval) {
                        const x = sketch.map(t, timeMin, timeMax, padding, width - padding);
                        const date = new Date(t);
                        const label = `${date.getMonth() + 1}/${date.getDate()}`;
                        sketch.text(label, x, height - padding + 5);
                    }
                };
            }, container);
        }
    }, [data]);

    return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
};
