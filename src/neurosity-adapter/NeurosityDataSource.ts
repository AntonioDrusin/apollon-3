import {Neurosity} from "@neurosity/sdk";
import {PowerByBand} from "@neurosity/sdk/dist/cjs/types/brainwaves";
import {Observable, Subject} from "rxjs";

export interface NeurosityData {
    alpha: number;
    beta: number;
    gamma: number;
    theta: number;
    delta: number;
    focus: number; // From SDK
    calm: number; // From SDK
}

export type KeysOfNeurosityData = keyof NeurosityData;

export interface OutputInfo {
    name: string;
    min: number;
    max: number;
    color: string;
}

export const DataSourceInfos: { [key in keyof NeurosityData]: OutputInfo } = {
    alpha: {name: "Alpha Average", min: 0, max: 200, color:"#54540c"},
    beta: {name: "Beta Average", min: 0, max: 200, color:"#225e40"},
    gamma: {name: "Gamma Average", min: 0, max: 200, color:"#8c642c"},
    theta: {name: "Theta Average", min: 0, max: 200, color:"#22505e"},
    delta: {name: "Delta Average", min: 0, max: 200, color:"#7e2133"},
    focus: {name: "Focus", min: 0, max: 1, color:"#235e1c"},
    calm: {name: "Calm", min: 0, max: 1, color:"#121d62"},
}

export class NeurosityDataSource {
    private _neurosity: Neurosity;
    private readonly _data$: Subject<NeurosityData>;
    private readonly _currentData: NeurosityData;

    constructor(neurosity: Neurosity) {
        this._neurosity = neurosity;
        this._data$ = new Subject<NeurosityData>();
        this._currentData = {
            alpha: 0,
            calm: 0,
            beta: 0,
            delta: 0,
            theta: 0,
            focus: 0,
            gamma: 0,
        }

        this.subscribe();
    }

    public get data$(): Observable<NeurosityData> {
        return this._data$;
    }

    subscribe(): void {
        this._neurosity.brainwaves("powerByBand").subscribe(
            // The SDK has an incorrect definition of PowerByBand
            (brainwaves: any) => {
                const powerByBand = (brainwaves.data as PowerByBand);
                this._currentData.alpha = this.process(powerByBand.alpha);
                this._currentData.beta = this.process(powerByBand.beta);
                this._currentData.theta = this.process(powerByBand.theta);
                this._currentData.delta = this.process(powerByBand.delta);
                this._currentData.gamma = this.process(powerByBand.gamma);
                this._data$.next(this._currentData);
            });

        this._neurosity.calm().subscribe((calm) => {
            this._currentData.calm = calm.probability;
        });

        this._neurosity.focus().subscribe((focus) => {
            this._currentData.focus = focus.probability;
        });
    }

    process(values: number[]): number {
        return values.reduce((a: number, b: number) => a + b) / 8;
    }

}