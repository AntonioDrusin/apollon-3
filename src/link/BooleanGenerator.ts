import {BooleanModulations} from "./ScreenLink";
import {noise2D} from "../visualizers/Noise";

interface State {
    time: number;
}

const states: { [key: string]: State } = {};


export function BooleanGenerator(modulation: BooleanModulations, value: number, threshold: number, valueKey: string): boolean {

    function triangle(time: number): number {
        const period = 1;
        return 2 * Math.abs(time / period - Math.floor((time / period) + 0.5));
    }

    function perlin(time: number): number {
        return noise2D(time, 0);
    }

    let state: State = states[valueKey] ?? {
        time: Math.random() * 500,
    };
    states[valueKey] = state;

    state.time += value;
    if (state.time > 1000000000) state.time = 0;

    switch (modulation) {
        case "triangle":
            value = triangle(state.time*value/8);
            break;
        case "perlin":
            value = perlin(state.time*value/8);
            break;
    }

    return value > threshold;

}

