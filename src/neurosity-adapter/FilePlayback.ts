import {INeurosityDataSource} from "./INeurosityDataSource";
import {BehaviorSubject, Observable, Subject} from "rxjs";
import {Calm} from "@neurosity/sdk/dist/esm/types/calm";
import {Focus} from "@neurosity/sdk/dist/esm/types/focus";
import {PowerByBand} from "@neurosity/sdk/dist/esm/types/brainwaves";
import {Reader} from "protobufjs";
import {NeurosityFileVersionRecord, NeurosityRecord} from "./NeurosityRecord";

export interface FileTag {
    timeStamp: number;
    label: string;
    index: number;
}

interface FileData {
    timestamp: number;
    powerByBand?: PowerByBand;
    calm?: number;
    focus?: number;
}

export interface PlaybackStatus {
    play: boolean;
    locationMilliseconds: number;
}

export class FilePlayback implements INeurosityDataSource {
    private _tags: FileTag[] = [];
    private _data: FileData[] = [];
    private _seconds: number[] = []; // index for each second in file;
    private _durationMilliseconds: number = 0;
    private _currentLocationMilliseconds: number = 0;
    private _beginningTimeStamp: number = 0;

    private _playbackStatus$ = new BehaviorSubject<PlaybackStatus>({play: false, locationMilliseconds: 0});


    private _current: number = 0;
    private _loaded: boolean = false;
    private _paused: boolean = true;

    private _calmSubject = new Subject<Calm>();
    private _focusSubject = new Subject<Focus>();
    private _powerByBandSubject = new Subject<PowerByBand>();

    public async load(fileHandle: FileSystemFileHandle) {
        const file = await fileHandle.getFile();
        const readResult = await file.stream().getReader().read();

        const reader = new Reader(readResult.value!);

        let index = 0;
        let beginning: number = 0;
        let ending: number = 0;

        // Read version and marker
        NeurosityFileVersionRecord.decodeDelimited(reader);

        while (reader.pos < reader.len) {
            const value = NeurosityRecord.decodeDelimited(reader);
            if (value) {
                if (index === 0) beginning = value.timestamp;
                ending = value.timestamp;
                if (value.powerBands) {
                    this._data.push({
                        powerByBand: {data: {...value.powerBands}} as any, // The SDK has an incorrect definition of PowerByBand
                        timestamp: value.timestamp
                    });
                }
                if (value.calm) {
                    this._data.push({
                        calm: value.calm,
                        timestamp: value.timestamp
                    });
                }
                if (value.focus) {
                    this._data.push({
                        focus: value.focus,
                        timestamp: value.timestamp
                    });
                }
                if (value.tag) {
                    this._tags.push({
                        index,
                        label: value.tag,
                        timeStamp: value.timestamp
                    });
                }

                index++;
            }
        }
        if (index !== 0) {
            this._loaded = true;
            this._beginningTimeStamp = beginning;
            this._durationMilliseconds = Math.floor(ending - beginning);
        }
        this.reset();

    }

    public reset() {
        this._current = 0;
        this._currentLocationMilliseconds = 0;
    }

    public async play() {
        const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

        if (!this._loaded) return;
        this._paused = false;

        this._playbackStatus$.next({
            play: true,
            locationMilliseconds: 0,
        });

        while (!this._paused) {
            const start = this._data[this._current].timestamp;
            this.next();

            if (this._paused) return;

            // Send update
            const newLocation = (start - this._beginningTimeStamp);
            if ( Math.floor(newLocation / 500) !== Math.floor(this._currentLocationMilliseconds / 50) ) {
                this._currentLocationMilliseconds = newLocation;
                this._playbackStatus$.next({
                    play: true,
                    locationMilliseconds: this._currentLocationMilliseconds,
                });
            }

            const end = this._data[this._current].timestamp
            await delay(end - start);
        }

    }

    public pause() {
        this._playbackStatus$.next({
            play: false,
            locationMilliseconds: this._currentLocationMilliseconds,
        });
        this._paused = true;
    }

    private next() {
        const data = this._data[this._current];
        if (data.powerByBand) {
            this._powerByBandSubject.next(data.powerByBand);
        }
        if (data.calm) {
            this._calmSubject.next({
                label: "calm",
                metric: "awareness",
                probability: data.calm,
                timestamp: data.timestamp
            });
        }
        if (data.focus) {
            this._focusSubject.next({
                label: "focus",
                metric: "awareness",
                probability: data.focus,
                timestamp: data.timestamp
            });
        }
        this._current++;
        if (this._current >= this._data.length) {
            this.pause();
            this.reset();
        }
    }

    get tags(): FileTag[] {
        return this._tags;
    }

    get calm$(): Observable<Calm> {
        return this._calmSubject;
    }

    get focus$(): Observable<Focus> {
        return this._focusSubject;
    }

    get powerByBand$(): Observable<PowerByBand> {
        return this._powerByBandSubject;
    }

    public get playStatus$(): Observable<PlaybackStatus> {
        return this._playbackStatus$;
    }

    public get durationMillseconds(): number {
        return this._durationMilliseconds;
    }

}