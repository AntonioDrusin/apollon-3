import {Neurosity} from "@neurosity/sdk";
import {PowerByBand} from "@neurosity/sdk/dist/cjs/types/brainwaves";
import {Observable, Subject} from "rxjs";
import {STATUS} from "@neurosity/sdk/dist/esm/types/status";
import {GraphSource} from "./GraphSource";

export interface OutputInfo {
    name: string;
    min: number;
    max: number;
    color: string;
}

export const NeurosityDataKeys = ["alpha", "beta", "gamma", "theta", "delta", "focus", "calm"] as const;
export type KeysOfNeurosityData = typeof NeurosityDataKeys[number];

export type NeurosityData = { [key in KeysOfNeurosityData]: number };
export type PartialNeurosityData = Partial<NeurosityData>;

export const DataSourceInfos: { [key in KeysOfNeurosityData]: OutputInfo } = {
    alpha: {name: "Alpha Average", min: 0, max: 200, color: "#da62a1"},
    beta: {name: "Beta Average", min: 0, max: 200, color: "#178ec5"},
    gamma: {name: "Gamma Average", min: 0, max: 200, color: "#00cbb9"},
    theta: {name: "Theta Average", min: 0, max: 200, color: "#ffd493"},
    delta: {name: "Delta Average", min: 0, max: 200, color: "#3ff3a8"},
    focus: {name: "Focus", min: 0, max: 1, color: "#3bb9f1"},
    calm: {name: "Calm", min: 0, max: 1, color: "#acafff"},
}

export class NeurosityDataSource implements GraphSource {
    private _neurosity: Neurosity;
    private readonly _data$: Subject<NeurosityData>;
    // @ts-ignore
    private _currentData: PartialNeurosityData;
    private _hasData: boolean;

    constructor(neurosity: Neurosity) {
        this._neurosity = neurosity;
        this._hasData = false;
        this._currentData = {};
        this._data$ = new Subject<NeurosityData>();
        this.subscribe();
    }

    public resetData(): void {
        this._currentData = {};
        this._hasData = false;
    }

    public get data$(): Observable<NeurosityData> {
        return this._data$;
    }

    private sendData() : void {
        if (!this._hasData) {
            this._hasData = NeurosityDataKeys.every( (k) => this._currentData[k] );
        }
        if ( this._hasData ) {
            this._data$.next(this._currentData as NeurosityData);
        }
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
                this.sendData();
            });

        this._neurosity.calm().subscribe((calm) => {
            this._currentData.calm = calm.probability;
            this.sendData();
        });

        this._neurosity.focus().subscribe((focus) => {
            this._currentData.focus = focus.probability;
            this.sendData();
        });

        this._neurosity.status().subscribe((status) => {
            if (status.state !== STATUS.ONLINE) {
                this.resetData()
            }
        });
    }

    process(values: number[]): number {
        return values.reduce((a: number, b: number) => a + b) / 8;
    }

}