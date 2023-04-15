import {KeysOfNeurosityData} from "../neurosity-adapter/OutputDataSource";
import {ColorModes} from "./ColorTransmission";

export interface ColorData {
    red: number;
    green: number;
    blue: number;
}

export interface InputData {
    visualizerLabel: string | null;
    parameters: (number | ColorData | boolean)[];
    paused: boolean;
    reset: number;
}

export interface ParameterMap {
    links: ParameterLink[];
}

export type ParameterMaps = { [k: string]: ParameterMap };

export const linkTypeNames = ["number", "color", "bool"];

export type LinkType = typeof linkTypeNames[number];


export interface NumberLink {
    manualValue: number;
    lowValue: number;
    highValue: number;
    outputKey: KeysOfNeurosityData | undefined;
}

export interface BooleanLink {
    threshold: number;
    manualValue: boolean;
    outputKey: KeysOfNeurosityData | undefined;
}

export interface NumbersLink {
    links: NumberLink[];
}

export type ColorModesLinks = { [key in ColorModes]: NumbersLink };

export interface ColorLink {
    colorMode: ColorModes;
    colorModeLinks: ColorModesLinks;
}

// These should be mutually exclusive
export interface ParameterLink {
    propertyKey: string;
    type: LinkType
    numberLink?: NumberLink;
    colorLink?: ColorLink;
    booleanLink?: BooleanLink;
}

export const __BROADCAST_CHANNEL_NAME__ = "Link.Broadcast."


