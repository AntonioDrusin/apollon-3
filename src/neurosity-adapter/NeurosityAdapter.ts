import {Neurosity} from "@neurosity/sdk";
import {DeviceInfo} from "@neurosity/sdk/dist/cjs/types/deviceInfo";
import {DeviceStatus} from "@neurosity/sdk/dist/esm/types/status";
import {combineLatest, map, Observable, Subject} from "rxjs";
import {Credentials} from "@neurosity/sdk/dist/cjs/types/credentials";
import {NeurosityDataSource} from "./NeurosityDataSource";
import {NeurosityDataProcessor} from "./NeurosityDataProcessor";


export class NeurosityAdapter {
    private readonly _neurosity: Neurosity;

    private _loggedIn: boolean;
    private readonly _devices$: Subject<DeviceInfo[]>;
    private readonly _loggedIn$: Subject<boolean>;
    private readonly _selectedDevice$: Subject<DeviceInfo | null>;
    private _dataSource: NeurosityDataSource;
    private _processor: NeurosityDataProcessor;

    constructor(neurosity: Neurosity, dataSource: NeurosityDataSource, dataProcessor: NeurosityDataProcessor) {
        this._loggedIn = false;
        this._neurosity = neurosity;
        this._dataSource = dataSource;
        this._processor = dataProcessor;

        this._devices$ = new Subject<DeviceInfo[]>();
        this._loggedIn$ = new Subject<boolean>();
        this._selectedDevice$ = new Subject<DeviceInfo | null>();

        this._neurosity.onAuthStateChanged().subscribe((user) => {
            this._loggedIn = !!user;
            this._loggedIn$.next(this._loggedIn);
            this.getDevices();
        });
    }

    get devices$(): Observable<DeviceInfo[]> {
        return this._devices$
    }

    get loggedIn$(): Observable<boolean> {
        return this._loggedIn$;
    }

    get selectedDevice$(): Observable<DeviceInfo | null> {
        return this._selectedDevice$;
    }

    get status$(): Observable<DeviceStatus> {
        return combineLatest([
            this._neurosity.status(),
            this._neurosity.streamingState()
        ]).pipe(map(([status, state]) => {
                return status;
            }
        ));
    }

    private getDevices(): void {
        if (!this._loggedIn) return;
        this._neurosity.getDevices().then((devices) => {
            this._devices$.next(devices);
        });
    }

    public selectDevice(deviceId: string): void {
        this._neurosity
            .selectDevice((devices) =>
                devices.find((device) => device.deviceId === deviceId) ||
                devices[0]
            )
            .then((device) => {
                this._selectedDevice$.next(device);
            });
    }

    public logIn(credentials: Credentials): Promise<void> {
        return this._neurosity.login(credentials);
    }

    public logOut(): void {
        this._neurosity.logout().then(() => {
            this._devices$.next([]);
            this._selectedDevice$.next(null);
            this._loggedIn$.next(false);
            this._dataSource.resetData();
        });
    }
}