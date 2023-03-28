import {__BROADCAST_CHANNEL_NAME__, InputData} from "./ScreenLink";
import {VisualizerDirectory, VisualizerInfo} from "../visualizers/VisualizerDirectory";
import {IVisualizer} from "../visualizers/IVisualizer";

interface VisualizerData {
    visualizer?: IVisualizer;
    element?: HTMLElement;
    info: VisualizerInfo;
}

export class ScreenLinkReceiver {
    private _channel: BroadcastChannel;
    private _data: InputData;
    private _directory: VisualizerDirectory;
    private readonly _visualizersData: { [k: string]: VisualizerData };
    private _current?: VisualizerData;
    private _width?: number;
    private _height?: number;
    private _parentElement?: HTMLElement;
    private _paused: boolean;

    constructor() {
        this._data = {visualizerLabel: null, parameters: [], paused: false};
        this._channel = new BroadcastChannel(__BROADCAST_CHANNEL_NAME__);
        this._channel.onmessage = (message) => {
            this._data = message.data;
            this.setVisualizer().then(r => {
                this.setParameters();
            });
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
        if (this._parentElement && this._width && this._height) {
            const label = this._data.visualizerLabel;
            if (label !== this._current?.info.label) {
                if (label) {
                    this.setCurrentElementHidden(true);
                    this._current?.visualizer?.pause();
                    this._current = this._visualizersData[label];
                    if ( !this._current.visualizer ) {
                        const element = document.createElement('div');
                        element.id = "div-visualizer-"+this._current.info.label;
                        this._parentElement.appendChild(element);
                        this._current.element = element;
                        this._current.visualizer = new this._visualizersData[label].info
                            .Constructor(this._width, this._height, element);
                        await this._current.visualizer?.load();
                    }
                    if ( !this._paused ) this._current.visualizer?.start();
                    this.setCurrentElementHidden(false);
                } else {
                    this._current = undefined;
                }
            }
        }
    }

    private setCurrentElementHidden(hidden: boolean) {
        if (this._current?.element) {
            this._current.element.hidden = hidden;
        }
    }

    private setParameters() {
        if (this._data.visualizerLabel && this._current) {
            const visualizer = this._current.visualizer as any;
            const info = this._current.info;
            info.inputs?.forEach((input, index) => {
                visualizer[input.propertyKey] = input.min + (input.max - input.min) * this._data.parameters[index];
            })

            const visualizerInterface = visualizer as IVisualizer;
            if ( this._paused && !this._data.paused) {
                visualizerInterface.start();
                this._paused = false;
            }
            if ( !this._paused && this._data.paused) {
                visualizerInterface.pause();
                this._paused = true;
            }

        }
    }

}