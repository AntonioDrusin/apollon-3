import {Neurosity} from "@neurosity/sdk";
import {DeviceInfo} from "@neurosity/sdk/dist/cjs/types/deviceInfo";
import {Observable, Subject} from "rxjs";


export class InputSignalAdapter {
    private _neurosity: Neurosity;
    private _loggedIn: boolean;
    private readonly _devices$: Subject<DeviceInfo[]>;

    constructor () {
        this._loggedIn = false;
        this._neurosity = new Neurosity({autoSelectDevice: false});
        this._devices$ = new Subject<DeviceInfo[]>();
        this._neurosity.onAuthStateChanged().subscribe(this.onAuthStateChanged)
    }

    get devices$() : Observable<DeviceInfo[]> {
        return this._devices$
    }

    private getDevices(): void {
        if (!this._loggedIn) return;
        this._neurosity.getDevices().then( (devices) => {
            this._devices$.next(devices);
        });
    }

    private onAuthStateChanged(user: any): void {
        this._loggedIn = !!user;
        this.getDevices();
    }
}