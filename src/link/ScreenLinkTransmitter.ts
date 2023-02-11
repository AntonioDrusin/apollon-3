import {NeurosityDataProcessor} from "../neurosity-adapter/NeurosityDataProcessor";
import {VisualizerDirectory} from "../visualizers/VisualizerDirectory";
import {NeurosityData} from "../neurosity-adapter/OutputDataSource";
import {__BROADCAST_CHANNEL_NAME__, InputData, ParameterMaps} from "./ScreenLink";
import {Settings} from "../services/Settings";

export class ScreenLinkTransmitter {

    private _maps: ParameterMaps;
    private _dataProcessor: NeurosityDataProcessor;
    private _channel: BroadcastChannel;
    private _visualizer: string | null;
    private _settings: Settings;
    private readonly _storageKey = "parameterMaps";
    private readonly _visualizerStorageKey = "selectedVisualizer";


    constructor(dataProcessor: NeurosityDataProcessor, settings: Settings) {
        const visualizers = new VisualizerDirectory();
        const maps: ParameterMaps = {};
        this._settings = settings;
        const loadedMaps = this._settings.getProp<ParameterMaps>(this._storageKey);
        visualizers.visualizers.forEach((v) => {
            // Deal with the fact that we have saved may not match the new visualizers we have
            maps[v.label] = loadedMaps?.[v.label] ?? {
                links: v.inputs.map(i => {
                    return {
                        manualValue: 0,
                        outputKey: null,
                    };
                })
            };
        });
        this._maps = maps;
        this._dataProcessor = dataProcessor;
        this._channel = new BroadcastChannel(__BROADCAST_CHANNEL_NAME__);
        this._dataProcessor.data$.subscribe((data) => {
            const message = this.mapData(data);
            this._channel.postMessage(message);
        });

        const loadedVisualizer = this._settings.getProp<string>(this._visualizerStorageKey);
        this._visualizer = loadedVisualizer && maps[loadedVisualizer] ? loadedVisualizer : null;
    }

    private mapData(data: NeurosityData): InputData {
        let parameters: number[] = [];
        if (this._visualizer) {
            parameters = this
                ._maps[this._visualizer].links
                .map((link) => link.outputKey ? data[link.outputKey] : link.manualValue);
        }
        return {
            visualizerLabel: this._visualizer,
            parameters: parameters
        }
    }

    public getMaps(): ParameterMaps {
        return this._maps;
    }

    public getVisualizer(): string | null {
        return this._visualizer;
    }


    public setMaps(maps: ParameterMaps): void {
        this._maps = maps;
        this._settings.setProp(this._storageKey, this._maps);
    }

    public setVisualizer(visualizerKey: string | null) {
        this._visualizer = visualizerKey;
        this._settings.setProp(this._visualizerStorageKey, this._visualizer);
    }
}