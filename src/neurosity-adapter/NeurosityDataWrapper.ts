import {Neurosity} from "@neurosity/sdk";
import {Observable} from "rxjs";
import {PowerByBand} from "@neurosity/sdk/dist/esm/types/brainwaves";
import {Calm} from "@neurosity/sdk/dist/esm/types/calm";
import {Focus} from "@neurosity/sdk/dist/esm/types/focus";
import {DeviceStatus} from "@neurosity/sdk/dist/esm/types/status";

export class NeurosityDataWrapper {
    private _neurosity: Neurosity;

    public constructor(neurosity: Neurosity) {
        this._neurosity = neurosity;
    }

    public powerByBand$(): Observable<PowerByBand> {
        return this._neurosity.brainwaves("powerByBand") as Observable<PowerByBand>;
    }

    public calm$(): Observable<Calm> {
        return this._neurosity.calm();
    }

    public focus$(): Observable<Focus> {
        return this._neurosity.focus();
    }

    public status$(): Observable<DeviceStatus> {
        return this._neurosity.status();
    }

}