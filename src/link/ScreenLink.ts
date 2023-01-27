import {KeysOfNeurosityData} from "../neurosity-adapter/NeurosityDataSource";
import {VisualizerDirectory} from "../visualizers/Visualizers";
import {NeurosityDataProcessor} from "../neurosity-adapter/NeurosityDataProcessor";

export interface InputData {
    visualizerLabel: string;
    parameters: number[];
}

export interface ParameterMap {
    links: ParameterLink[];
}

export type ParameterMaps = { [k: string]: ParameterMap };

export interface ParameterLink {
    manualValue: number;
    outputKey: KeysOfNeurosityData | null;
}

export class ScreenLinkTransmitter {

    private _maps: { [k: string]: ParameterMap };
    private _dataProcessor: NeurosityDataProcessor;

    constructor(dataProcessor: NeurosityDataProcessor) {
        const visualizers = new VisualizerDirectory();
        const maps: ParameterMaps = {};
        visualizers.visualizers.forEach((v) => {
            maps[v.label] = {
                links: v.inputs.map(i => {
                    return {
                        manualValue: 0,
                        outputKey: null,
                    };
                })
            }
        });
        this._maps = maps;
        this._dataProcessor = dataProcessor;
    }

    public getMap(visualizerKey: string): ParameterMap {
        return this._maps[visualizerKey];
    }

    public getMaps(): ParameterMaps {
        return this._maps;
    }

    public setMaps(maps: ParameterMaps): void {
        this._maps = maps;
    }

    private readonly LocalStorageKey: string = "LocalStorage.ScreenLink.LinkData";

    // The local storage stuff maybe goes somewhere else
    private putData(data: InputData) {
        localStorage.setItem(this.LocalStorageKey, JSON.stringify(data));
    }

}


export class ScreenLinkReceiver {
    public getData(): InputData {
        return {
            parameters: [],
            visualizerLabel: "visualizer"
        };
    }

}