import {NeurosityDataProcessor} from "../neurosity-adapter/NeurosityDataProcessor";
import {VisualizerDirectory} from "../visualizers/VisualizerDirectory";
import {NeurosityData} from "../neurosity-adapter/OutputDataSource";
import {__BROADCAST_CHANNEL_NAME__, InputData, ParameterMaps} from "./ScreenLink";
import {Settings} from "../services/Settings";
import {BehaviorSubject, Observable, Subject, withLatestFrom} from "rxjs";

export interface VisualizerChange {
    visualizer: string | null;
}
export class ScreenLinkTransmitter {

    private _maps: ParameterMaps;
    private _dataProcessor: NeurosityDataProcessor;
    private _channel: BroadcastChannel;
    private _visualizer: string | null;
    private _settings: Settings;
    private readonly _storageKey = "parameterMaps";
    private readonly _visualizerStorageKey = "selectedVisualizer";
    private readonly _visualizerChange$ = new Subject<VisualizerChange>()

    private readonly _paused$ = new BehaviorSubject<boolean>(false);

    constructor(dataProcessor: NeurosityDataProcessor, settings: Settings) {
        const visualizers = new VisualizerDirectory();
        const maps: ParameterMaps = {};
        this._settings = settings;
        const loadedMaps = this._settings.getProp<ParameterMaps>(this._storageKey);
        visualizers.visualizers.forEach((v) => {
            v.inputs ||= [];
            // Deal with the fact that we have saved may not match the new visualizers we have
            let loadedMap = loadedMaps?.[v.label]
            if (loadedMap && loadedMap.links.length !== v.inputs.length) { // If we mismatch the length, clear out the maps.
                loadedMap = undefined;
            }
            maps[v.label] = loadedMap ?? {
                links: Array(v.inputs.length).fill({
                    manualValue: 0,
                    outputKey: null,
                })
            };
        });
        this._maps = maps;
        this._dataProcessor = dataProcessor;
        this._channel = new BroadcastChannel(__BROADCAST_CHANNEL_NAME__);
        this._dataProcessor.data$
            .pipe(withLatestFrom(this._paused$))
            .subscribe(([data, paused]) => {
                const message = this.mapData(data, paused);
                this._channel.postMessage(message);
            });

        const loadedVisualizer = this._settings.getProp<string>(this._visualizerStorageKey);
        this._visualizer = loadedVisualizer && maps[loadedVisualizer] ? loadedVisualizer : null;
    }

    private mapData(data: NeurosityData, paused: boolean): InputData {
        let parameters: number[] = [];
        if (this._visualizer) {
            parameters = this
                ._maps[this._visualizer].links
                .map((link) => link.outputKey ? data[link.outputKey] : link.manualValue);
        }
        return {
            visualizerLabel: this._visualizer,
            parameters: parameters,
            paused: paused,
        }
    }

    public getMaps(): ParameterMaps {
        return this._maps;
    }

    public getVisualizer(): string | null {
        return this._visualizer;
    }

    public get visualizerChanges$(): Observable<VisualizerChange> {
        return this._visualizerChange$;
    }

    public setMaps(maps: ParameterMaps): void {
        this._maps = maps;
        this._settings.setProp(this._storageKey, this._maps);
    }

    public setVisualizer(visualizerKey: string | null) {
        this._visualizer = visualizerKey;
        this._settings.setProp(this._visualizerStorageKey, this._visualizer);
        this._visualizerChange$.next({visualizer: visualizerKey})
    }

    public paused$(): Observable<boolean> {
        return this._paused$;
    }

    public pause() {
        this._paused$.next(true);
    }

    public play() {
        this._paused$.next(false);
    }
}