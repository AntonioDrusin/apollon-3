import {IVisualizerColor} from "../visualizers/IVisualizer";
import {ColorModes} from "./ColorTransmission";

export function ColorGenerator(mode: ColorModes, a: number, b: number, c: number): IVisualizerColor {

    function HSV(h: number, s: number, v: number): IVisualizerColor {
        if (s <= 0) return {red: 0, green: 0, blue: 0};
        let hh: number = h * 360;
        hh = hh / 60;
        const i = Math.floor(hh);
        const ff = hh - i;
        const p = v * (1 - s);
        const q = v * (1 - (s * ff));
        const t = v * (1 - (s * (1 - ff)));
        switch (i) {
            case 0: return {red: v, green: t, blue: p};
            case 1: return {red: q, green: v, blue: p};
            case 2: return {red: p, green: v, blue: t};
            case 3: return {red: p, green: q, blue: v};
            case 4: return {red: t, green: p, blue: v};
            case 5:
            default: return {red: v, green: p, blue: q};
        }
    }

    switch (mode) {
        case "rgb":
            return {red: a, green: b, blue: c};
        case "hsv":
            return HSV(a, b, c);
        default: return {red: a, green: b, blue: c};
    }
}