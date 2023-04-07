
export const ColorModeNames = ["rgb","hsv","perlin","lab"];

export type ColorModes = typeof ColorModeNames[number];

export interface ColorModeInfo {
    name: string;
    inputNames: string[];
}
export const colorModes: {[key in ColorModes]: ColorModeInfo} = {
    rgb: {name: "RGB", inputNames: ["Red","Green","Blue"]},
    hsv: {name: "HSV", inputNames: ["Hue","Saturation","Value"]},
    perlin: {name: "Perlin Noise", inputNames: ["Variance","Amplitude"]},
    lab: {name: "Lab", inputNames: ["L","a","b"]}
}