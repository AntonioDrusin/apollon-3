import {Neurosity} from "@neurosity/sdk";
import {PowerByBand} from "@neurosity/sdk/dist/cjs/types/brainwaves";
import {BehaviorSubject, Observable, Subject} from "rxjs";
import {STATUS} from "@neurosity/sdk/dist/esm/types/status";

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
    default: number;
    color: string;
}

export const DataSourceInfos: { [key in keyof NeurosityData]: OutputInfo } = {
    alpha: {name: "Alpha Average", min: 0, max: 200, default: 20, color: "#54540c"},
    beta: {name: "Beta Average", min: 0, max: 200, default: 20, color: "#225e40"},
    gamma: {name: "Gamma Average", min: 0, max: 200, default: 20, color: "#8c642c"},
    theta: {name: "Theta Average", min: 0, max: 200, default: 20, color: "#22505e"},
    delta: {name: "Delta Average", min: 0, max: 200, default: 20, color: "#7e2133"},
    focus: {name: "Focus", min: 0, max: 1, default: .2, color: "#235e1c"},
    calm: {name: "Calm", min: 0, max: 1, default: .2, color: "#121d62"},
}

export class NeurosityDataSource {
    private _neurosity: Neurosity;
    private readonly _data$: BehaviorSubject<NeurosityData>;
    // @ts-ignore
    private _currentData: NeurosityData;

    constructor(neurosity: Neurosity) {
        this._neurosity = neurosity;
        this._currentData = this.getDefaultData();
        this._data$ = new BehaviorSubject<NeurosityData>(this._currentData);
        this.subscribe();
    }

    public resetData(): void {
        this._currentData = this.getDefaultData();
        this._data$.next(this._currentData);
    }

    private getDefaultData(): NeurosityData {
        const currentData : any = {};
        for ( const key in DataSourceInfos) {
            const dataKey = key as KeysOfNeurosityData;
            currentData[dataKey] = DataSourceInfos[dataKey].default;
        }
        return currentData as NeurosityData;
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