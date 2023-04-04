import {NeurosityDataProcessor} from "../neurosity-adapter/NeurosityDataProcessor";
import {VisualizerDirectory} from "../visualizers/VisualizerDirectory";
import {NeurosityData} from "../neurosity-adapter/OutputDataSource";
import {__BROADCAST_CHANNEL_NAME__, InputData, NumberLink, ParameterLink, ParameterMaps} from "./ScreenLink";
import {Settings} from "../services/Settings";
import {BehaviorSubject, Observable, Subject, withLatestFrom} from "rxjs";
import {IVisualizerColor} from "../visualizers/IVisualizer";
import * as _ from "lodash";
import {ColorGenerator} from "./ColorGenerator";

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

            // We could do better than dropping everything.
            // This matches the settings saved in local store with what the visualizer has declared.
            // If we mismatch the length drop the loaded map
            if (loadedMap && loadedMap.links.length !== v.inputs.length) { // If we mismatch the length, clear out the maps.
                loadedMap = undefined;
            } else if (loadedMap) {
                // if we mismatch any of the keys, drop the map
                const inputKeys = _.map(v.inputs, (i) => i.propertyKey);
                const linksKeys = _.map(loadedMap.links, (l) => l.propertyKey);
                if (!_.isEqual(inputKeys, linksKeys)) {
                    loadedMap = undefined;
                }
            }
            // needs to fill depending on what actually we have, right?
            if (loadedMap) {
                maps[v.label] = loadedMap;
            } else {
                const newLinks = _.map(v.inputs, (i) => {
                    return {
                        propertyKey: i.propertyKey,
                        type: i.type,
                        colorLink: i.type === "color" ? {} : null,// MUST MAKE THIS MAKE SENSE with manualvalue and outputKey...
                        numberLink: i.type === "number" ? {} : null,
                    } as ParameterLink
                })
                maps[v.label] = {links: newLinks};
            }
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

    private static getNumberLinkValue(link: NumberLink | null | undefined, data: NeurosityData): number {
        if (link) return link.outputKey ? data[link.outputKey] : link.manualValue;
        return 0;
    }

    private mapData(data: NeurosityData, paused: boolean): InputData {

        let parameters: (number | IVisualizerColor)[] = [];
        if (this._visualizer) {
            parameters = this
                ._maps[this._visualizer].links
                .map((link) => {
                    if (link.type === "number") {
                        return ScreenLinkTransmitter.getNumberLinkValue(link.numberLink, data);
                    } else if (link.type === "color") {
                        if (link.colorLink) {
                            const values = link.colorLink!.values[link.colorLink.colorMode];
                            if (values) {
                                const a = ScreenLinkTransmitter.getNumberLinkValue(values.links[0], data);
                                const b = ScreenLinkTransmitter.getNumberLinkValue(values.links[1], data);
                                let c = 0;
                                if (link.colorLink!.colorMode !== "perlin") {
                                    c = ScreenLinkTransmitter.getNumberLinkValue(values.links[2], data);
                                }
                                return ColorGenerator(link.colorLink!.colorMode, a, b, c);
                            }
                        }
                        return {red: 0, green: 0.8, blue: 0.0};
                    }
                    return 0.0;
                });
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