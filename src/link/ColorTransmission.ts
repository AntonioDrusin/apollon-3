
export const ColorModeNames = ["rgb","hsv", "lab", "perlin_rgb", "perlin_hsv", "perlin_lab"];

export type ColorModes = typeof ColorModeNames[number];

export interface ColorModeInfo {
    name: string;
    inputNames: string[];
}
export const colorModes: {[key in ColorModes]: ColorModeInfo} = {
    rgb: {name: "color.rgb", inputNames: ["color.red","color.green","color.blue"]},
    hsv: {name: "color.hsv", inputNames: ["color.hue","color.saturation","color.value"]},
    perlin_rgb: {name: "color.rgbPerlin", inputNames: ["color.variance","color.amplitude"]},
    perlin_hsv: {name: "color.hsvPerlin", inputNames: ["color.variance","color.amplitude"]},
    perlin_lab: {name: "color.labPerlin", inputNames: ["color.variance","color.amplitude"]},
    lab: {name: "color.lab", inputNames: ["color.l","color.a","color.b"]}
}