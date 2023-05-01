import {IVisualizerColor} from "../visualizers/IVisualizer";
import {ColorModes} from "./ColorTransmission";
import {noise2D} from "../visualizers/apparitions/Noise";

interface XYZ {
    x: number;
    y: number;
    z: number;
}

interface PerlinState {
    offsets: number[];
    values: number[];
}

const perlinStates: { [key: string]: PerlinState } = {};

export function ColorGenerator(mode: ColorModes, a: number, b: number, c: number, valueKey: string): IVisualizerColor {

    function HSV(h: number, s: number, v: number): IVisualizerColor {
        h = h * 360; // Denormalize h

        const c = v * s;
        const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
        const m = v - c;
        const sextant = Math.floor(h / 60);

        switch (sextant) {
            case 0:
                return {red: c + m, green: x + m, blue: m};
            case 1:
                return {red: x + m, green: c + m, blue: m};
            case 2:
                return {red: 0 + m, green: c + m, blue: x + m};
            case 3:
                return {red: 0 + m, green: x + m, blue: c + m};
            case 4:
                return {red: x + m, green: 0 + m, blue: c + m};
            case 5:
            default:
                return {red: c + m, green: 0 + m, blue: x + m};
        }
    }

    function LAB_to_XYZ(l: number, a: number, b: number): XYZ {
        const white: XYZ = {x: 95.047, y: 100.00, z: 108.883};
        const epsilon = 0.008856;
        const kappa = 903.3

        const fy = (l + 16) / 116;
        const fz = fy - (b / 200);
        const fx = (a / 500) + fy;

        const x = (fx ** 3) > epsilon ? (fx ** 3) : (116 * fx - 16) / kappa;
        const y = l > (epsilon * kappa) ? (((l + 16) / 116) ** 3) : l / kappa;
        const z = (fz ** 3) > epsilon ? (fz ** 3) : (116 * fz - 16) / kappa;

        return {x: x * white.x, y: y * white.y, z: z * white.z};
    }

    function XYZ_to_RGB(color: XYZ): IVisualizerColor {
        // http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
        // Best RGB
        const M = [[1.7552599, -0.4836786, -0.2530000],
            [-0.5441336, 1.5068789, 0.0215528],
            [0.0063467, -0.0175761, 1.2256959]];

        const R = M[0][0] * color.x + M[0][1] * color.y + M[0][2] * color.z;
        const G = M[1][0] * color.x + M[1][1] * color.y + M[1][2] * color.z;
        const B = M[2][0] * color.x + M[2][1] * color.y + M[2][2] * color.z;
        return {red: R, green: G, blue: B}
    }

    function LAB(l: number, a: number, b: number): IVisualizerColor {
        return XYZ_to_RGB(LAB_to_XYZ(l, a, b));
    }

    function wrap(value: number, from: number, to: number): number {
        return from + Math.abs((value - from) % (to - from));
    }

    function generatePerlinColor(speed: number, amplification: number, key: string): IVisualizerColor {
        speed *= 4;
        amplification *= 0.2;

        let state: PerlinState = perlinStates[key] ??= {
            offsets: [Math.random() * 40000, Math.random() * 40000, Math.random() * 40000],
            values: [Math.random(), Math.random(), Math.random()]
        };
        state.offsets[0] += speed;
        state.offsets[1] += speed;
        state.offsets[2] += speed;
        const red = wrap(state.values[0] + noise2D(state.offsets[0], 0) * amplification, 0, 1);
        const green = wrap(state.values[1] + noise2D(state.offsets[1], 0) * amplification, 0, 1);
        const blue = wrap(state.values[2] + noise2D(state.offsets[2], 0) * amplification, 0, 1);
        state.values[0] = red;
        state.values[1] = green;
        state.values[2] = blue;

        return {
            red: red,
            green: green,
            blue: blue,
        }
    }

    switch (mode) {
        case "rgb":
            return {red: a, green: b, blue: c};
        case "hsv":
            return HSV(a, b, c);
        case "lab":
            return LAB(a * 10, 100 - b * 200, 100 - c * 200);
        case "perlin_rgb":
            const cr = generatePerlinColor(a, b, `${valueKey}:${mode}`);
            return cr;
        case "perlin_hsv":
            const ch = generatePerlinColor(a, b, `${valueKey}:${mode}`);
            return HSV(ch.red, ch.green, ch.blue);
        case "perlin_lab":
            const cl = generatePerlinColor(a, b, `${valueKey}:${mode}`);
            return LAB(cl.red, cl.green, cl.blue);
        default:
            return {red: a, green: b, blue: c};
    }
}