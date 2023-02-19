import "reflect-metadata";
import {VisualizersMap} from "./VisualizersMap";

export interface VisualizerInfo {
    Constructor: any;
    label: string;
    p5mode: string;
    inputs: InputInfo[];
}

export interface InputInfo {
    label: string;
    min: number;
    max: number;
    propertyKey: string;
}

export class VisualizerDirectory {

    _info: Map<string, VisualizerInfo>;

    constructor() {
        const __FIELD_VISUALIZERS_METADATA_KEY = "Field.Visualizers.Metadata.Key";
        this._info = new Map<string, VisualizerInfo>();
        let property: keyof typeof VisualizersMap;
        for (property in VisualizersMap) {
            const info = Reflect.getMetadata(__FIELD_VISUALIZERS_METADATA_KEY, VisualizersMap[property]) as VisualizerInfo;
            info.Constructor = VisualizersMap[property];
            this._info.set(info.label, info);
        }

    }

    public get visualizers(): VisualizerInfo[] {
        const all: VisualizerInfo[] = [];
        this._info.forEach((v) => all.push(v));
        return all
    }
}

export function visualizer(label: string, p5mode: "2d" | "webgl") {
    return function (constructor: Function) {
        const __FIELD_VISUALIZERS_METADATA_KEY = "Field.Visualizers.Metadata.Key";
        const meta = Reflect.getMetadata(__FIELD_VISUALIZERS_METADATA_KEY, constructor);
        meta.label = label;
        meta.p5mode = p5mode;
    };
}

export function numberInput(label: string, from: number, to: number) {
    return function (target: Object, propertyKey: string | symbol) {
        const __FIELD_VISUALIZERS_METADATA_KEY = "Field.Visualizers.Metadata.Key";
        const metaData = Reflect.getMetadata(__FIELD_VISUALIZERS_METADATA_KEY, target.constructor) || {};
        metaData.inputs ||= [];
        metaData.inputs.push({label, min: from, max: to, propertyKey} as InputInfo);
        Reflect.defineMetadata(__FIELD_VISUALIZERS_METADATA_KEY, metaData, target.constructor);
    }
}


