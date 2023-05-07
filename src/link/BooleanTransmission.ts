import {BooleanModulations} from "./ScreenLink";

export interface BooleanModulationInfo {
    name: string;
}

export const booleanModulationModes: {[key in BooleanModulations]: BooleanModulationInfo } = {
    none: {name: "None"},
    triangle: {name: "Triangle"},
    perlin: {name: "Perlin"},
}