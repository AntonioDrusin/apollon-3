import {KeysOfNeurosityData} from "../neurosity-adapter/OutputDataSource";
import {ColorModes} from "./ColorTransmission";

export interface ColorData {
    red: number;
    green: number;
    blue: number;
}

export interface InputData {
    visualizerLabel: string | null;
    parameters: (number | ColorData)[];
    paused: boolean;
}

export interface ParameterMap {
    links: ParameterLink[];
}

export type ParameterMaps = { [k: string]: ParameterMap };

export const linkTypeNames = ["number", "color"];
export type LinkType = typeof linkTypeNames[number];

export interface NumberLink {
    manualValue: number;
    outputKey: KeysOfNeurosityData | undefined;
}

export interface NumbersLink {
    links: NumberLink[];
}

export interface ColorLink {
    colorMode: ColorModes;
    values: { [key in ColorModes]: NumbersLink };
}

// These should be mutually exclusive
export interface ParameterLink {
    propertyKey: string;
    type: LinkType
    numberLink?: NumberLink;
    colorLink?: ColorLink;
}

export const __BROADCAST_CHANNEL_NAME__ = "Link.Broadcast."


