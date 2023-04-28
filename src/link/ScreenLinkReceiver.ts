import {
    __BROADCAST_CHANNEL_NAME__,
    __BROADCAST_IMAGE_CHANNEL_NAME__, __BROADCAST_IMAGE_REQUEST_CHANNEL_NAME__,
    ColorData,
    ImageMessage,
    InputData
} from "./ScreenLink";
import {VisualizerDirectory, VisualizerInfo} from "../visualizers/VisualizerDirectory";
import {IVisualizer, IVisualizerColor} from "../visualizers/IVisualizer";

interface VisualizerData {
    visualizer?: IVisualizer;
    element?: HTMLElement;
    info: VisualizerInfo;
}

export class ScreenLinkReceiver {
    private _channel: BroadcastChannel;
    private _imageChannel: BroadcastChannel;
    private _requestChannel: BroadcastChannel;
    private _data: InputData;
    private _directory: VisualizerDirectory;
    private readonly _visualizersData: { [k: string]: VisualizerData };
    private _current?: VisualizerData;
    private _width?: number;
    private _height?: number;
    private _parentElement?: HTMLElement;
    private _paused: boolean;
    private _reset?: number;
    private _ready: boolean;

    private readonly _images: { [key: string]: string | undefined } = {};

    constructor() {
        this._data = {visualizerLabel: null, parameters: [], paused: false, reset: 0};
        this._ready = false;

        this._imageChannel = new BroadcastChannel(__BROADCAST_IMAGE_CHANNEL_NAME__);
        this._imageChannel.onmessage = (message) => {
            const imageMessage = message.data as ImageMessage;
            if (imageMessage) {
                if (imageMessage.key === "DONE") {
                    this._ready = true;
                    console.log("Images received");
                } else {
                    this._images[imageMessage.key] = imageMessage.url;
                }
            }
        };

        this._requestChannel = new BroadcastChannel(__BROADCAST_IMAGE_REQUEST_CHANNEL_NAME__);
        this._requestChannel.postMessage("");

        this._channel = new BroadcastChannel(__BROADCAST_CHANNEL_NAME__);
        this._channel.onmessage = (message) => {
            this._data = message.data;
            this.setVisualizer().then(r => {});
        }

        this._directory = new VisualizerDirectory();
        const visualizerData: { [k: string]: VisualizerData } = {};
        this._directory.visualizers.forEach((v) => {
            visualizerData[v.label] = {info: v};
        });
        this._visualizersData = visualizerData;

        this._current = undefined;
        this._paused = false;
    }

    public linkVisualizer(width: number, height: number, ref: HTMLElement) {
        this._width = width;
        this._height = height;
        this._parentElement = ref;
    }

    private async setVisualizer() {
        if (this._parentElement && this._width && this._height && this._ready) {
            const label = this._data.visualizerLabel;
            if (label !== this._current?.info.label) {
                if (label) {
                    this.setCurrentElementHidden(true);
                    this._current?.visualizer?.pause();
                    this._current = this._visualizersData[label];
                    if (!this._current.visualizer) {
                        const element = document.createElement('div');
                        element.id = "div-visualizer-" + this._current.info.label;
                        this._parentElement.appendChild(element);
                        this._current.element = element;
                        this._current.visualizer = new this._visualizersData[label].info
                            .Constructor(this._width, this._height, element);
                        this.setParameters();
                        await this._current.visualizer?.load();
                    }
                    if (!this._paused) this._current.visualizer?.start();
                    this.setCurrentElementHidden(false);
                } else {
                    this._current = undefined;
                }
            }
        }
        this.setParameters();
    }

    private setCurrentElementHidden(hidden: boolean) {
        if (this._current?.element) {
            this._current.element.hidden = hidden;
        }
    }

    private setParameters() {
        if (this._data.visualizerLabel && this._current) {
            if (this._reset === undefined || this._data.reset === 0) {
                this._reset = this._data.reset;
            }
            if (this._reset !== this._data.reset) {
                window.location.reload();
            }
            const visualizer = this._current.visualizer as any;
            const info = this._current.info;
            info.inputs?.forEach((input, index) => {
                switch (input.type) {
                    case "number": {
                        const parameterValue: number = this._data.parameters[index] as number
                        const inputValue = input.min! + (input.max! - input.min!) * parameterValue;
                        visualizer[input.propertyKey] = inputValue;
                        break;
                    }
                    case "color": {
                        const parameterValue: ColorData = this._data.parameters[index] as ColorData;
                        const color = visualizer[input.propertyKey] as IVisualizerColor;
                        color.red = parameterValue.red;
                        color.green = parameterValue.green;
                        color.blue = parameterValue.blue;
                        break;
                    }
                    case "boolean": {
                        visualizer[input.propertyKey] = this._data.parameters[index] as boolean;
                        break;
                    }
                    case "image": {
                        const key = this._data.parameters[index] as string;
                        if (key && this._images[key]) {
                            visualizer[input.propertyKey] = this._images[key];
                            console.log("Image key set");
                        }
                        break;
                    }
                }
            })

            const visualizerInterface = visualizer as IVisualizer;
            if (this._paused && !this._data.paused) {
                visualizerInterface.start();
                this._paused = false;
            }
            if (!this._paused && this._data.paused) {
                visualizerInterface.pause();
                this._paused = true;
            }

        }
    }

}