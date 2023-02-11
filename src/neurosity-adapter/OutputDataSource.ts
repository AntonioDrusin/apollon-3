import {PowerByBand} from "@neurosity/sdk/dist/cjs/types/brainwaves";
import {Observable, Subject} from "rxjs";
import {STATUS} from "@neurosity/sdk/dist/esm/types/status";
import {GraphSource} from "./GraphSource";
import {NeurosityDataWrapper} from "./NeurosityDataWrapper";

export interface OutputInfo {
    name: string;
    min: number;
    max: number;
    color: string;
}

// https://docs.neurosity.co/docs/api/brainwaves/
const CP3 = 0;
const C3 = 1;
const F5 = 2;
const PO3 = 3;
const PO4 = 4;
const F6 = 5;
const C4 = 6;
const CP4 = 7;

export const NeurosityDataKeys = [
    "alpha", "beta", "gamma", "theta", "delta", "focus", "calm",
    "valence", "vigilance", "engagement", "workload"
] as const;
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
    valence: {name: "Valence", min: 0, max: 1, color: "#1caf7f"},
    vigilance: {name: "Vigilance", min: 0, max: 1, color: "#2caf9f"},
    engagement: {name: "Engagement", min: 0, max: 1, color: "#3cafaf"},
    workload: {name: "Workload", min: 0, max: 1, color: "#4cafff"},
}

export class OutputDataSource implements GraphSource {
    private _neurosity: NeurosityDataWrapper;
    private readonly _data$: Subject<NeurosityData>;
    // @ts-ignore
    private _currentData: PartialNeurosityData;
    private _hasData: boolean;

    constructor(neurosity: NeurosityDataWrapper) {
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

    private sendData(): void {
        if (!this._hasData) {
            this._hasData = NeurosityDataKeys.every((k) => this._currentData[k]);
        }
        if (this._hasData) {
            this._data$.next(this._currentData as NeurosityData);
        }
    }

    private subscribe(): void {
        this._neurosity.powerByBand$().subscribe(
            // The SDK has an incorrect definition of PowerByBand
            (brainwaves: any) => {
                const data = (brainwaves.data as PowerByBand);

                // Averages
                this._currentData.alpha = this.avg(data.alpha);
                this._currentData.beta = this.avg(data.beta);
                this._currentData.theta = this.avg(data.theta);
                this._currentData.delta = this.avg(data.delta);
                this._currentData.gamma = this.avg(data.gamma);

                this._currentData.engagement =
                    this.savg(data.alpha, [PO3, PO4])
                    / this.savg(data.theta, [C3, C4])

                this._currentData.valence =
                    (data.alpha[PO3] + data.alpha[F5])
                    / (data.alpha[PO4] + data.alpha[F6]);

                this._currentData.workload =
                    (this.savg(data.delta, [F5,F6]) + this.savg(data.theta,[F5,F6]))
                    / this.savg(data.alpha, [PO3, PO4]);

                this._currentData.vigilance = this._currentData.beta / this._currentData.theta;

                this.sendData();
            });

        this._neurosity.calm$().subscribe((calm) => {
            this._currentData.calm = calm.probability;
            this.sendData();
        });

        this._neurosity.focus$().subscribe((focus) => {
            this._currentData.focus = focus.probability;
            this.sendData();
        });

        this._neurosity.status$().subscribe((status) => {
            if (status.state !== STATUS.ONLINE) {
                this.resetData()
            }
        });
    }

    // returns the average of an array
    private avg(values: number[]): number {
        return values.reduce((a: number, b: number) => a + b) / values.length;
    }

    // returns average of specified channels
    private savg(values: number[], channels: number[]): number {
        return this.avg(channels.map((c) => values[c]));
    }


}