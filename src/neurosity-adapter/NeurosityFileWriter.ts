import {NeurosityDataWrapper} from "./NeurosityDataWrapper";
import {from, Observable, Subject, Subscription} from "rxjs";
import {NeurosityFileVersionRecord, NeurosityRecord, PowerBandsRecord} from "./NeurosityRecord";

export interface DataPersisterStatus {
    currentFileLength: number;
    startTime: Date;
    lastSaveTime: Date;
    recordingFileName: string;
}

export class NeurosityFileWriter {
    private _neurosityDataWrapper: NeurosityDataWrapper;
    private _subscriptions: Subscription[] = [];
    private _writable?: FileSystemWritableFileStream;
    private _lastWriteTime?: Date;
    private _startTime?: Date;
    private _size?: number;
    private _name?: string;
    private _persisterDataSource: Subject<DataPersisterStatus> = new Subject<DataPersisterStatus>();

    public constructor(neurosityDataWrapper: NeurosityDataWrapper) {
        this._neurosityDataWrapper = neurosityDataWrapper;
    }

    public get status$(): Observable<DataPersisterStatus> {
        return this._persisterDataSource;
    }

    public async startRecording(): Promise<boolean> {
        const file = await window.showSaveFilePicker();
        if (file) {
            this._writable = await file.createWritable({keepExistingData: false});
            this._lastWriteTime = new Date();
            this._startTime = new Date();
            this._size = 0;
            this._name = file.name;

            await this.writeHeader();

            this._subscriptions.forEach((s) => s.unsubscribe());
            this._subscriptions = [
                this._neurosityDataWrapper.powerByBand$.subscribe((data) => {
                    return this.writeRecord({
                        messageType: "powerBands",
                        powerBands: {...data}
                    });
                }),
                this._neurosityDataWrapper.calm$.subscribe((data) => {
                    return this.writeRecord({
                        messageType: "calm",
                        calm: data.probability
                    });
                }),
                this._neurosityDataWrapper.focus$.subscribe((data) => {
                    return this.writeRecord({
                        messageType: "focus",
                        focus: data.probability
                    });
                }),
            ];

            this._persisterDataSource.next({
                lastSaveTime: this._startTime,
                currentFileLength: 0,
                recordingFileName: this._name,
                startTime: this._startTime
            });

            return true;
        }
        return false;
    }

    private async writeHeader() {
        if ( this._writable ) {
            const record = new NeurosityFileVersionRecord();
            record.majorVersion = 1;
            record.minorVersion = 0;
            record.identifier = "Neurosity";

            let writer = NeurosityFileVersionRecord.encodeDelimited(record);
            let buffer = writer.finish();
            this._size = (this._size || 0) + buffer.length;
            await this._writable.write({data: buffer, type: "write"});
        }
    }

    private writeRecord(source: any) {
        if (this._writable) {
            const time: Date = new Date();
            const record = new NeurosityRecord();

            record.tag = source.tag;
            record.powerBands = source.powerBands
                ? PowerBandsRecord.fromObject(source.powerBands.data)
                : undefined;
            record.calm = source.calm;
            record.focus = source.focus;
            record.messageType = source.messageType;
            record.timestamp = time.getTime();

            let writer = NeurosityRecord.encodeDelimited(record);
            let buffer = writer.finish();
            this._size = (this._size || 0) + buffer.length;

            this._lastWriteTime ||= new Date(0);

            let updateDelta = (time.getTime() - this._lastWriteTime!.getTime()) / 1000;
            if (updateDelta > 1) {
                this._lastWriteTime = time;
                this._persisterDataSource.next({
                    lastSaveTime: time,
                    currentFileLength: this._size || 0,
                    recordingFileName: this._name || "",
                    startTime: this._startTime || new Date()
                });
            }
            return from(this._writable.write({data: buffer, type: "write"}));
        }
    }

    public addTag(tag: string) {
        if (this._writable) {
            this.writeRecord({messageType: "tag", tag: tag})
        }
    }

    public async stopRecording() {
        const stream = this._writable; // Avoids a writeRecord to write to a closing stream
        this._writable = undefined;
        if (stream) {
            await stream.close();
        }
        this._subscriptions.forEach((s) => s.unsubscribe());
        this._subscriptions = [];
        // console.log("Write completed");
        //
        // const f = await tempFile.getFile();
        // const readBuffer = await f.stream().getReader().read();
        // const zz = NeurosityRecord.decodeDelimited(readBuffer.value!);
        // console.log(JSON.stringify(zz));

        // const root = await navigator.storage.getDirectory();
    }
}