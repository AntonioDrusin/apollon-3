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
    private readonly _reset$ = new BehaviorSubject<number>(0);
    private _reset = 0;

    constructor(dataProcessor: NeurosityDataProcessor, settings: Settings, store: OutputMapStore) {
        this._settings = settings;
        this._dataProcessor = dataProcessor;
        this._store = store;
        this._channel = new BroadcastChannel(__BROADCAST_CHANNEL_NAME__);

        this._dataProcessor.data$
            .pipe(
                withLatestFrom(this._reset$, this._paused$, this._store.parameterMap$),
            )
            .subscribe(([data, reset, paused, parameterMaps]) => {
                const message = this.mapData(data, reset, paused, parameterMaps);
                this._channel.postMessage(message);
            });

        this._visualizerKey = this._settings.getProp<string>(this._visualizerStorageKey) || null;
    }

    private static getNumberLinkValue(link: NumberLink | null | undefined, data: NeurosityData): number {
        if (link) {

            const value = link.outputKey ? data[link.outputKey] : link.manualValue;
            if ( link.lowValue === link.highValue) return 0;
            if ( link.lowValue <= link.highValue ) {
                return link.lowValue + (link.highValue-link.lowValue)*value;
            }
            else {
                let unwrapped = link.lowValue + (link.highValue-link.lowValue+1)*value;
                if ( unwrapped > 1.0 ) unwrapped -= 1.0;
                return unwrapped;
            }
        }
        return 0;
    }

    private mapData(data: NeurosityData, reset: number, paused: boolean, parameterMaps: ParameterMaps): InputData {
        let parameters: (number | IVisualizerColor | boolean | string | undefined)[] = [];
        if (this._visualizerKey) {
            parameters = parameterMaps[this._visualizerKey].links
                .map((link) => {
                    switch (link.type) {
                        case "number":
                            return ScreenLinkTransmitter.getNumberLinkValue(link.numberLink, data);
                        case "color":
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
                        case "boolean":
                            if (link.booleanLink) {
                                if (link.booleanLink.outputKey) {
                                    return data[link.booleanLink.outputKey] > link.booleanLink.threshold;
                                } else {
                                    return link.booleanLink.manualValue;
                                }
                            }
                            return true;
                        case "image":
                            if ( link.imageLink ) {
                                return link.imageLink.imageUrl;
                            }
                            return undefined;
                        default:
                            return 0.0;
                    }
                });
        }
        return {
            visualizerLabel: this._visualizerKey,
            parameters: parameters,
            paused: paused,
            reset: reset,
        }
    }

    public getVisualizer(): string | null {
        return this._visualizerKey;
    }

    public get visualizerChanges$(): Observable<VisualizerChange> {
        return this._visualizerChange$;
    }


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

    public reset() {
        this._reset += 1;
        this._reset$.next(this._reset);
    }
}