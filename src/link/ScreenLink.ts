import {KeysOfNeurosityData} from "../neurosity-adapter/OutputDataSource";
import {ColorModes} from "./ColorTransmission";

export interface ColorData {
    red: number;
    green: number;
    blue: number;
}

export interface InputData {
    visualizerLabel: string | null;
    parameters: (number | ColorData | boolean | string | undefined)[];
    options: number[];
    paused: boolean;
    reset: number;
}

export interface ParameterMap {
    links: ParameterLink[];
    options: OptionsLink[];
}

export type ParameterMaps = { [k: string]: ParameterMap };

export const linkTypeNames = ["number", "color", "bool", "image", "names"];
export type LinkType = typeof linkTypeNames[number];


export interface NumberLink {
    manualValue: number;
    lowValue: number;
    highValue: number;
    outputKey: KeysOfNeurosityData | undefined;
    curve: string;
}

export const BooleanModulationNames = ["none", "triangle", "perlin"];
export type BooleanModulations = typeof BooleanModulationNames[number];

export interface BooleanLink {
    threshold: number;
    numberLink: NumberLink;
    modulation: BooleanModulations;
}

export interface NumbersLink {
    links: NumberLink[];
}

export interface ImageLink {
    imageUrl?: string;
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
    imageLink?: ImageLink;
}

export interface OptionsLink {
    key: string;
    value: number;
}

export interface ImageMessage {
    key: string;
    url?: string; // Done separately so we can send large data urls
}


export const __BROADCAST_CHANNEL_NAME__ = "Link.Broadcast.Data";
export const __BROADCAST_NAMES_CHANNEL_NAME__ = "Link.Broadcast.Names";
export const __BROADCAST_IMAGE_CHANNEL_NAME__ = "Link.Broadcast.Image";
export const __BROADCAST_IMAGE_REQUEST_CHANNEL_NAME__ = "Link.Broadcast.ImageRequest";


