
export const ColorModeNames = ["rgb","hsv", "lab", "perlin_rgb", "perlin_hsv", "perlin_lab"];

export type ColorModes = typeof ColorModeNames[number];

export interface ColorModeInfo {
    name: string;
    inputNames: string[];
}
export const colorModes: {[key in ColorModes]: ColorModeInfo} = {
    rgb: {name: "RGB", inputNames: ["Red","Green","Blue"]},
    hsv: {name: "HSV", inputNames: ["Hue","Saturation","Value"]},
    perlin_rgb: {name: "Perlin RGB", inputNames: ["Variance","Amplitude"]},
    perlin_hsv: {name: "Perlin HSV", inputNames: ["Variance","Amplitude"]},
    perlin_lab: {name: "Perlin LAB", inputNames: ["Variance","Amplitude"]},
    lab: {name: "Lab", inputNames: ["L","a","b"]}
}