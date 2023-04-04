import {INeurosityDataSource} from "./INeurosityDataSource";
import {BehaviorSubject, Observable} from "rxjs";
import {Calm} from "@neurosity/sdk/dist/esm/types/calm";
import {Focus} from "@neurosity/sdk/dist/esm/types/focus";
import {PowerByBand} from "@neurosity/sdk/dist/esm/types/brainwaves";
import {Reader} from "protobufjs";
import {NeurosityFileVersionRecord, NeurosityRecord} from "./NeurosityRecord";

export interface FileTag {
    timeStamp: number;
    locationMilliseconds: number;
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

    private _calmSubject = new BehaviorSubject<Calm | null>(null);
    private _focusSubject = new BehaviorSubject<Focus | null>(null);
    private _powerByBandSubject = new BehaviorSubject<PowerByBand | null>(null);

    public async load(fileHandle: FileSystemFileHandle) {
        const file = await fileHandle.getFile();
        const fileReader = file.stream().getReader();
        let readResult = await fileReader.read();


        let index = 0;
        let beginning: number = 0;
        let ending: number = 0;
        let currentSecond: number = 0;
        this._seconds.push(0);

        let reader = new Reader(readResult.value!);
        // Read version and marker
        NeurosityFileVersionRecord.decodeDelimited(reader);


        while (reader.pos < reader.len) {
            let value = null;

            value = NeurosityRecord.decodeDelimited(reader);

            if (!readResult.done && (reader.pos / reader.len) > .90) {
                readResult = await fileReader.read();
                if (readResult.value) {
                    const leftLength = reader.len - reader.pos;
                    if (leftLength > 0) {
                        const mergedArray = new Uint8Array(readResult.value.length + leftLength);
                        mergedArray.set(reader.buf.slice(reader.pos, reader.len), 0);
                        mergedArray.set(readResult.value, leftLength);
                        reader = new Reader(mergedArray)
                    } else {
                        reader = new Reader(readResult.value)
                    }
                }
            }

            if (value) {
                if (index === 0) beginning = value.timestamp;
                ending = value.timestamp;

                const newPositionSecond = Math.floor((value.timestamp - beginning) / 1000);
                if (newPositionSecond !== currentSecond) {
                    currentSecond = newPositionSecond;
                    this._seconds.push(index);
                }

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
                        timeStamp: value.timestamp,
                        locationMilliseconds: value.timestamp - beginning
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
        this.sendNulls();
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
            if (Math.floor(newLocation / 500) !== Math.floor(this._currentLocationMilliseconds / 50)) {
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
        this.sendCurrentPausedPosition();
        this._paused = true;
        this.sendNulls();
    }

    private sendCurrentPausedPosition() {
        this._playbackStatus$.next({
            play: false,
            locationMilliseconds: this._currentLocationMilliseconds,
        });
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

    private sendNulls() {
        this._powerByBandSubject.next(null);
        this._calmSubject.next(null);
        this._focusSubject.next(null);
    }

    get tags(): FileTag[] {
        return this._tags;
    }

    get calm$(): Observable<Calm | null> {
        return this._calmSubject;
    }

    get focus$(): Observable<Focus | null> {
        return this._focusSubject;
    }

    get powerByBand$(): Observable<PowerByBand | null> {
        return this._powerByBandSubject;
    }

    public get playStatus$(): Observable<PlaybackStatus> {
        return this._playbackStatus$;
    }

    public get durationMilliseconds(): number {
        return this._durationMilliseconds;
    }

    public setPositionSeconds(seconds: number) {
        const index = Math.floor(seconds);
        if (this._seconds[index]) {
            this.setPositionIndex(this._seconds[index]);
        }
    }

    public setPositionIndex(index: number) {
        this._current = index;
        if (this._paused) {
            this._currentLocationMilliseconds = this._data[index].timestamp - this._beginningTimeStamp;
            this.sendCurrentPausedPosition();
        }
    }

}