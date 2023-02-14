import {__BROADCAST_CHANNEL_NAME__, InputData} from "./ScreenLink";
import {Visualizer, VisualizerDirectory, VisualizerInfo} from "../visualizers/VisualizerDirectory";

export class ScreenLinkReceiver {
    private _channel: BroadcastChannel;
    private _data: InputData;
    private _directory: VisualizerDirectory;
    private readonly _visualizersMap: { [k: string]: VisualizerInfo };
    private readonly _currentLabel: string | null;
    private _current: Visualizer | null;

    constructor() {
        this._data = {visualizerLabel: null, parameters: []};
        this._channel = new BroadcastChannel(__BROADCAST_CHANNEL_NAME__);
        this._channel.onmessage = (message) => {
            this._data = message.data;
        }
        this._directory = new VisualizerDirectory();
        const visualizersMap: { [k: string]: VisualizerInfo } = {};
        this._directory.visualizers.forEach((v) => {
            visualizersMap[v.label] = v;
        });
        this._visualizersMap = visualizersMap;

        this._currentLabel = null;
        this._current = null;
    }

    public getData(): InputData {
        return this._data;
    }

    public getVisualizer(label: string): Visualizer {
        if (label !== this._currentLabel) {
            this._current = new this._visualizersMap[label].Constructor();
        }
        return this._current as Visualizer;
    }

    public setVisualizerParameters(visualizer: any, data: InputData) {
        if (data.visualizerLabel) {
            const info = this._visualizersMap[data.visualizerLabel];
            info.inputs.forEach((input, index) => {
                visualizer[input.propertyKey] = input.min + (input.max - input.min) * data.parameters[index];
            })
        }
    }

}