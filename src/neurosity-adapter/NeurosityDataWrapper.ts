import {Neurosity} from "@neurosity/sdk";
import {BehaviorSubject, Observable, share, switchAll} from "rxjs";
import {PowerByBand} from "@neurosity/sdk/dist/esm/types/brainwaves";
import {Calm} from "@neurosity/sdk/dist/esm/types/calm";
import {Focus} from "@neurosity/sdk/dist/esm/types/focus";
import {DeviceStatus} from "@neurosity/sdk/dist/esm/types/status";
import {INeurosityDataSource} from "./INeurosityDataSource";

export class NeurosityDataWrapper implements INeurosityDataSource {
    private _neurosity: Neurosity;
    private _switchPowerByBand$: BehaviorSubject<Observable<PowerByBand>>;
    private _switchCalm$: BehaviorSubject<Observable<Calm>>;
    private _switchFocus$: BehaviorSubject<Observable<Focus>>;

    public constructor(neurosity: Neurosity) {
        this._neurosity = neurosity;

        this._switchPowerByBand$ = new BehaviorSubject(this._neurosity.brainwaves("powerByBand") as Observable<PowerByBand>);
        this._switchCalm$ = new BehaviorSubject(this._neurosity.calm());
        this._switchFocus$ = new BehaviorSubject(this._neurosity.focus());
    }

    public setDataSourceToLive() {
        this._switchPowerByBand$.next(this._neurosity.brainwaves("powerByBand")  as Observable<PowerByBand>);
        this._switchCalm$.next(this._neurosity.calm());
        this._switchFocus$.next(this._neurosity.focus());
    }

    public setDataSourceTo(source: INeurosityDataSource) {
        this._switchPowerByBand$.next(source.powerByBand$);
        this._switchCalm$.next(source.calm$);
        this._switchFocus$.next(source.focus$);
    }

    public get powerByBand$(): Observable<PowerByBand> {
        return this._switchPowerByBand$.pipe(
            switchAll(),
            share(),
        );
    }

    public get calm$(): Observable<Calm> {
        return this._switchCalm$.pipe(
            switchAll(),
            share(),
        );
    }

    public get focus$(): Observable<Focus> {
        return this._switchFocus$.pipe(
            switchAll(),
            share(),
        );
    }

}