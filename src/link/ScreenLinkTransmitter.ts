import {NeurosityDataProcessor} from "../neurosity-adapter/NeurosityDataProcessor";
import {VisualizerDirectory} from "../visualizers/VisualizerDirectory";
import {NeurosityData} from "../neurosity-adapter/NeurosityDataSource";
import {__BROADCAST_CHANNEL_NAME__, InputData, ParameterMap, ParameterMaps} from "./ScreenLink";

export class ScreenLinkTransmitter {

    private _maps: { [k: string]: ParameterMap };
    private _dataProcessor: NeurosityDataProcessor;
    private _channel: BroadcastChannel;
    private _visualizer: string | null;

    constructor(dataProcessor: NeurosityDataProcessor) {
        const visualizers = new VisualizerDirectory();
        const maps: ParameterMaps = {};
        visualizers.visualizers.forEach((v) => {
            maps[v.label] = {
                links: v.inputs.map(i => {
                    return {
                        manualValue: 0,
                        outputKey: null,
                    };
                })
            }
        });
        this._maps = maps;
        this._dataProcessor = dataProcessor;
        this._channel = new BroadcastChannel(__BROADCAST_CHANNEL_NAME__);
        this._dataProcessor.data$.subscribe((data) => {
            const message = this.mapData(data);
            this._channel.postMessage(message);
        });
        this._visualizer = null;
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

    public setMaps(maps: ParameterMaps): void {
        this._maps = maps;
    }

    public setVisualizer(visualizerKey: string | null) {
        this._visualizer = visualizerKey;
    }
}