import {KeysOfNeurosityData} from "../neurosity-adapter/NeurosityDataSource";
import {VisualizerDirectory} from "../visualizers/Visualizers";

export interface LinkData {
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

export class ScreenLink {

    private static _me: ScreenLink;
    private _maps: { [k: string]: ParameterMap };

    constructor() {
        const visualizers = new VisualizerDirectory();
        const maps : ParameterMaps = {};
        visualizers.visualizers.forEach((v) =>{
            maps[v.label]= {
                links: v.inputs.map(i=> { return {
                    manualValue: 0,
                    outputKey: null,
                };})
            }
        });
        this._maps = maps;
    }

    static instance(): ScreenLink {
        if (!ScreenLink._me) ScreenLink._me = new ScreenLink();
        return ScreenLink._me;
    }

    public getMap(visualizerKey: string): ParameterMap {
        return this._maps[visualizerKey];
    }

    public getMaps(): ParameterMaps {
        return this._maps;
    }

    public noop(): void {}

    public setMaps(maps: ParameterMaps): void {
        this._maps = maps;
    }

    private readonly LocalStorageKey: string = "LocalStorage.ScreenLink.LinkData";

    // The local storage stuff maybe goes somewhere else
    public putData(data: LinkData) {
        localStorage.setItem(this.LocalStorageKey, JSON.stringify(data));
    }

    public getData(): LinkData | null {
        const text = localStorage.getItem(this.LocalStorageKey);
        return text ? JSON.parse(text) : null;
    }
}
