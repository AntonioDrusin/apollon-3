import {KeysOfNeurosityData} from "../neurosity-adapter/OutputDataSource";

export interface InputData {
    visualizerLabel: string | null;
    parameters: number[];
    paused: boolean;
}

export interface ParameterMap {
    links: ParameterLink[];
}

export type ParameterMaps = { [k: string]: ParameterMap };

export interface ParameterLink {
    manualValue: number;
    outputKey: KeysOfNeurosityData | null;
}

export const __BROADCAST_CHANNEL_NAME__ = "Link.Broadcast."


