import {Neurosity} from "@neurosity/sdk";
import {DeviceInfo} from "@neurosity/sdk/dist/cjs/types/deviceInfo";
import {DeviceStatus} from "@neurosity/sdk/dist/esm/types/status";
import {BehaviorSubject, Observable, Subject} from "rxjs";
import {Credentials} from "@neurosity/sdk/dist/cjs/types/credentials";
import {OutputDataSource} from "./OutputDataSource";
import {Settings} from "../services/Settings";
import {SignalQuality} from "@neurosity/sdk/dist/esm/types/signalQuality";


export class NeurosityAdapter {
    private readonly _neurosity: Neurosity;

    private _loggedIn: boolean;
    private readonly _devices$: Subject<DeviceInfo[]>;
    private readonly _loggedIn$: Subject<boolean>;
    private readonly _selectedDevice$: BehaviorSubject<DeviceInfo | null>;
    private _dataSource: OutputDataSource;
    private _settings: Settings;

    constructor(neurosity: Neurosity, dataSource: OutputDataSource, settings: Settings) {
        this._loggedIn = false;
        this._neurosity = neurosity;
        this._dataSource = dataSource;

        this._devices$ = new Subject<DeviceInfo[]>();
        this._loggedIn$ = new Subject<boolean>();
        this._selectedDevice$ = new BehaviorSubject<DeviceInfo | null>(null);

        this._settings = settings;

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
        return this._neurosity.status();
    }

    get signalQuality$(): Observable<SignalQuality> {
        return this._neurosity.signalQuality();
    }

    private getDevices(): void {
        if (!this._loggedIn) return;
        this._neurosity.getDevices().then((devices) => {
            this._devices$.next(devices);
            this.restoreSavedDevice(devices);
        });
    }

    private restoreSavedDevice(devices: DeviceInfo[]) {
        const savedDeviceId = this._settings.getProp("deviceId");
        const selectedDevice = devices.find((d) => d.deviceId === savedDeviceId);
        if (selectedDevice) this.selectDevice(selectedDevice.deviceId);

    }

    public selectDevice(deviceId: string): void {
        this._neurosity
            .selectDevice((devices) =>
                devices.find((device) => device.deviceId === deviceId) ||
                devices[0]
            )
            .then((device) => {
                this._selectedDevice$.next(device);
                this._settings.setProp("deviceId", deviceId);
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