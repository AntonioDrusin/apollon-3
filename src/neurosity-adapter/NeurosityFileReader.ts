import {NeurosityDataWrapper} from "./NeurosityDataWrapper";
import {FilePlayback, FileTag, PlaybackStatus} from "./FilePlayback";
import {BehaviorSubject, Observable, share, Subject, switchAll} from "rxjs";

export interface FileActive {
    active: boolean;
    tags?: FileTag[];
    name?: string;
    durationMilliseconds: number;
}

export class NeurosityFileReader {
    private _neurosityDataWrapper: NeurosityDataWrapper;
    private _playback?: FilePlayback;
    private _active$ = new BehaviorSubject<FileActive>({active: false, durationMilliseconds: 0});
    private _playbackStatus$ = new Subject<Observable<PlaybackStatus>>();

    constructor(neurosityDataWrapper: NeurosityDataWrapper) {
        this._neurosityDataWrapper = neurosityDataWrapper;
    }

    public async loadFile(): Promise<boolean> {
        const files = await window.showOpenFilePicker();
        if (!files) {
            this._active$.next({active: false, durationMilliseconds: 0});
            return false;
        }

        this._playback = await this.load(files[0]);
        this._neurosityDataWrapper.setDataSourceTo(this._playback);
        const fileInfo = await files[0].getFile();
        this._active$.next({
            active: true,
            tags: this._playback.tags,
            durationMilliseconds: this._playback.durationMilliseconds,
            name: fileInfo.name,
        });
        this._playbackStatus$.next(this._playback.playStatus$);
        return true;
    }

    private async load(file: FileSystemFileHandle): Promise<FilePlayback> {
        const playback = new FilePlayback();
        await playback.load(file);
        return playback;
    }

    public pause() {
        this._playback?.pause();
    }

    public get playStatus$(): Observable<PlaybackStatus> {
        return  this._playbackStatus$.pipe(
            switchAll(),
            share()
        );
    }

    public get active$(): Observable<FileActive> {
        return this._active$;
    }

    public play() {
        this._playback?.play();
    }

    public setPositionSeconds(second: number) {
        this._playback?.setPositionSeconds(second);
    }

    public setPositionIndex(index: number) {
        this._playback?.setPositionIndex(index);
    }

    public eject() {
        this._neurosityDataWrapper.setDataSourceToLive();
        this._playback?.pause();
        this._playback = undefined;
        this._active$.next({active: false, durationMilliseconds: 0});
    }
}

