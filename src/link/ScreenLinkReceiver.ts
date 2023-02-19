import {__BROADCAST_CHANNEL_NAME__, InputData} from "./ScreenLink";
import {VisualizerDirectory, VisualizerInfo} from "../visualizers/VisualizerDirectory";
import {IVisualizer} from "../visualizers/IVisualizer";

export class ScreenLinkReceiver {
    private _channel: BroadcastChannel;
    private _data: InputData;
    private _directory: VisualizerDirectory;
    private readonly _visualizersMap: { [k: string]: VisualizerInfo };
    private _currentLabel?: string;
    private _current?: IVisualizer;
    private _currentInfo?: VisualizerInfo;
    private _width?: number;
    private _height?: number;
    private _ref?: Element;

    constructor() {
        this._data = {visualizerLabel: null, parameters: []};
        this._channel = new BroadcastChannel(__BROADCAST_CHANNEL_NAME__);
        this._channel.onmessage = (message) => {
            this._data = message.data;
            this.setVisualizer()
            this.setParameters();
        }
        this._directory = new VisualizerDirectory();
        const visualizersMap: { [k: string]: VisualizerInfo } = {};
        this._directory.visualizers.forEach((v) => {
            visualizersMap[v.label] = v;
        });
        this._visualizersMap = visualizersMap;

        this._currentLabel = undefined;
        this._current = undefined;
    }

    public linkVisualizer(width: number, height: number, ref: Element) {
        this._width = width;
        this._height = height;
        this._ref = ref;
    }

    private setVisualizer() {
        if (this._ref && this._width && this._height) {
            const label = this._data.visualizerLabel;
            if (label !== this._currentLabel) {
                this._current?.clear();
                if (label) {
                    this._current = new this._visualizersMap[label].Constructor();
                    this._current!.init(this._width, this._height, this._ref);
                    this._currentInfo = this._visualizersMap[label];
                } else {
                    this._current = undefined;
                    this._currentInfo = undefined;
                }
                this._currentLabel = label || undefined;
            }
        }
    }

    private setParameters() {
        if (this._data.visualizerLabel && this._currentInfo && this._current) {
            const info = this._currentInfo;
            const visualizer = this._current as any;
            info.inputs.forEach((input, index) => {
                visualizer[input.propertyKey] = input.min + (input.max - input.min) * this._data.parameters[index];
            })
        }
    }

}