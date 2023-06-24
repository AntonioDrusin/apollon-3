import {BooleanModulations} from "./ScreenLink";

export interface BooleanModulationInfo {
    name: string;
}

export const booleanModulationModes: {[key in BooleanModulations]: BooleanModulationInfo } = {
    none: {name: "booleanModulation.none"},
    triangle: {name: "booleanModulation.triangle"},
    perlin: {name: "booleanModulation.perlin"},
}