import {NeurosityDataProcessor} from "../neurosity-adapter/NeurosityDataProcessor";
import {NeurosityData} from "../neurosity-adapter/OutputDataSource";
import {__BROADCAST_CHANNEL_NAME__, InputData, NumberLink, ParameterMaps} from "./ScreenLink";
import {Settings} from "../services/Settings";
import {BehaviorSubject, Observable, Subject, withLatestFrom} from "rxjs";
import {IVisualizerColor} from "../visualizers/IVisualizer";
import {ColorGenerator} from "./ColorGenerator";
import {OutputMapStore} from "./OutputMapStore";

export interface VisualizerChange {
    visualizer: string | null;
}

export class ScreenLinkTransmitter {
    private _store: OutputMapStore;
    private _dataProcessor: NeurosityDataProcessor;
    private _channel: BroadcastChannel;
    private _visualizerKey: string | null;
    private _settings: Settings;
    private readonly _visualizerStorageKey = "selectedVisualizer";
    private readonly _visualizerChange$ = new Subject<VisualizerChange>()

    private readonly _paused$ = new BehaviorSubject<boolean>(false);

    constructor(dataProcessor: NeurosityDataProcessor, settings: Settings, store: OutputMapStore) {
        this._settings = settings;
        this._dataProcessor = dataProcessor;
        this._store = store;
        this._channel = new BroadcastChannel(__BROADCAST_CHANNEL_NAME__);

        this._dataProcessor.data$
            .pipe(withLatestFrom(this._paused$, this._store.parameterMap$))
            .subscribe(([data, paused, parameterMaps]) => {
                const message = this.mapData(data, paused, parameterMaps);
                this._channel.postMessage(message);
            });

        this._visualizerKey = this._settings.getProp<string>(this._visualizerStorageKey) || null;
    }

    private static getNumberLinkValue(link: NumberLink | null | undefined, data: NeurosityData): number {
        if (link) return link.outputKey ? data[link.outputKey] : link.manualValue;
        return 0;
    }

    private mapData(data: NeurosityData, paused: boolean, parameterMaps: ParameterMaps): InputData {
        let parameters: (number | IVisualizerColor)[] = [];
        if (this._visualizerKey) {
            parameters = parameterMaps[this._visualizerKey].links
                .map((link) => {
                    if (link.type === "number") {
                        return ScreenLinkTransmitter.getNumberLinkValue(link.numberLink, data);
                    } else if (link.type === "color") {
                        if (link.colorLink) {
                            const values = link.colorLink!.colorModeLinks[link.colorLink.colorMode];
                            if (values) {
                                const a = ScreenLinkTransmitter.getNumberLinkValue(values.links[0], data);
                                const b = ScreenLinkTransmitter.getNumberLinkValue(values.links[1], data);
                                const c = ScreenLinkTransmitter.getNumberLinkValue(values.links[2] || 0, data);
                                return ColorGenerator(link.colorLink!.colorMode, a, b, c, `${this._visualizerKey}:${link.propertyKey}`);
                            }
                        }
                        return {red: 0, green: 0.8, blue: 0.0};
                    }
                    return 0.0;
                });
        }
        return {
            visualizerLabel: this._visualizerKey,
            parameters: parameters,
            paused: paused,
        }
    }

    public getVisualizer(): string | null {
        return this._visualizerKey;
    }

    public get visualizerChanges$(): Observable<VisualizerChange> {
        return this._visualizerChange$;
    }

    // Moved to OutputMapStore.ts
    // public setMaps(maps: ParameterMaps): void {
    //     this._maps = maps;
    //     this._settings.setProp(this._storageKey, this._maps);
    // }

    public setVisualizer(visualizerKey: string | null) {
        this._visualizerKey = visualizerKey;
        this._settings.setProp(this._visualizerStorageKey, this._visualizerKey);
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