import {
    BooleanLink,
    ColorLink,
    ColorModesLinks,
    ImageLink,
    NumberLink,
    ParameterLink, ParameterMap,
    ParameterMaps, OptionsLink, NumbersLink
} from "./ScreenLink";
import {OptionInfo, VisualizerDirectory, VisualizerInfo} from "../visualizers/VisualizerDirectory";
import * as _ from "lodash";
import {Settings} from "../services/Settings";
import {BehaviorSubject, debounceTime, Observable} from "rxjs";
import {forEach} from "lodash";
import {ColorModeNames} from "./ColorTransmission";

export interface ErrorMessage {
    text: string,
    data?: object
}

export class OutputMapStore {

    private readonly _maps: ParameterMaps;
    private readonly _parameterMap$: BehaviorSubject<ParameterMaps>;
    private readonly _storageKey = "parameterMaps_1.4"; // Up this version if you break compat
    private _settings: Settings;
    private _t: any;

    constructor(settings: Settings) {
        this._settings = settings;
        this._maps = this.readMapsFromStorage();
        this._parameterMap$ = new BehaviorSubject<ParameterMaps>(this._maps);

        this._parameterMap$.pipe(
            debounceTime(10000)
        ).subscribe((maps) => {
            this.writeMapsToStorage(maps);
        });
    }

    private writeMapsToStorage(maps: ParameterMaps) {
        this._settings.setProp(this._storageKey, maps);
    }

    // factor this out of here
    private readMapsFromStorage() {
        const loadedMaps = this._settings.getProp<ParameterMaps>(this._storageKey);
        const visualizers = new VisualizerDirectory();
        const maps: ParameterMaps = {};
        visualizers.visualizers.forEach((v) => {
            // Deal with the fact that we have saved may not match the new visualizers we have
            let loadedMap = loadedMaps?.[v.label]
            maps[v.label] = this.verifyLoadedMap(loadedMap, v);

        });
        return maps;
    }

    private verifyLoadedMap(loadedMap: ParameterMap | undefined, v: VisualizerInfo): ParameterMap {
        v.inputs ||= [];

        // Prep the no value items
        const noNumber = (): NumberLink => {
            return {manualValue: 0, outputKey: undefined, highValue: 1, lowValue: 0, curve: "linear"}
        };
        const noImage = (): ImageLink => {
            return {}
        };
        const noColorLinks = (): ColorModesLinks => {
            const cl: ColorModesLinks = {};
            forEach(ColorModeNames, (colorMode) => {
                cl[colorMode] = {
                    links: _.map([0, 1, 2], () => {
                        return noNumber();
                    })
                }
            });
            return cl;
        };
        const noBoolean = (): BooleanLink => {
            return {threshold: 0, modulation: "none", numberLink: noNumber()}
        };


        let newLinks: ParameterLink[] = [];
        let links: ParameterLink[] = [];
        if (loadedMap?.links) {
            links = loadedMap.links;
        }
        let linksMap = _.reduce(links, (a: any, b) => {
            a[b.propertyKey] = b;
            return a;
        }, {})


        forEach(v.inputs, (input) => {
            let link = linksMap[input.propertyKey] as ParameterLink;
            if (link && link.type === input.type) {
                if (link.type === "boolean") {
                    link.booleanLink ??= noBoolean();
                    link.booleanLink.modulation ??= "none";
                    link.booleanLink.numberLink ??= noNumber();
                    link.booleanLink.numberLink.curve ??= "linear";
                }
                if (link.type === "number") {
                    link.numberLink ??= noNumber();
                    link.numberLink.curve ??= "linear";
                }
                if (link.type === "color" && link.colorLink) {
                    this.SetAllCurves(link.colorLink.colorModeLinks.rgb, 3);
                    this.SetAllCurves(link.colorLink.colorModeLinks.hsv, 3);
                    this.SetAllCurves(link.colorLink.colorModeLinks.lab, 3);
                    this.SetAllCurves(link.colorLink.colorModeLinks.perlin_rgb, 2);
                    this.SetAllCurves(link.colorLink.colorModeLinks.perlin_hsv, 2);
                    this.SetAllCurves(link.colorLink.colorModeLinks.perlin_lab, 2);
                }
            } else {
                link = {
                    propertyKey: input.propertyKey,
                    type: input.type,
                    colorLink: input.type === "color" ? {
                        colorMode: "rgb",
                        colorModeLinks: noColorLinks(),
                    } : null,
                    numberLink: input.type === "number" ? noNumber() : null,
                    imageLink: input.type === "image" ? noImage() : null,
                    booleanLink: input.type === "boolean" ? noBoolean() : null,
                } as ParameterLink;
            }
            newLinks.push(link);
        });

        const newOptions = this.mapOptions(v.options, loadedMap?.options)

        return {links: newLinks, options: newOptions};
    }

    private SetAllCurves(link: NumbersLink, length: number) {
        for (let t = 0; t < length; t++) {
            link.links[t].curve ??= "linear";
        }
    }

    mapOptions(optionInfos?: OptionInfo[], options?: OptionsLink[]) {
        optionInfos ||= [];
        const newOptions: OptionsLink[] = [];
        options ||= [];

        let optionsMap: { [k: string]: OptionsLink } = _.reduce(options, (a: any, b) => {
            a[b.key] = b;
            return a;
        }, {})

        forEach(optionInfos, (info) => {
            let option = optionsMap[info.label];
            if (option) {
                if (option.value === null || option.value > info.options.length - 1) option.value = 0;
                newOptions.push({key: option.key, value: option.value});
            } else {
                newOptions.push({key: info.label, value: 0});
            }
        });
        return newOptions;
    }


    public get parameterMap$(): Observable<ParameterMaps> {
        return this._parameterMap$;
    }

    public setOptions(visualizerKey: string, options: OptionsLink[]) {
        this._maps[visualizerKey].options = options;
        this._parameterMap$.next(this._maps);
    }

    public setParameterLink(visualizerKey: string, linkIndex: number, link: NumberLink | ColorLink | BooleanLink | ImageLink) {
        // refactor to not need the whole ParameterLink
        const map = this._maps[visualizerKey].links[linkIndex];
        switch (map.type) {
            case "number": {
                map.numberLink = link as NumberLink;
                break;
            }
            case "color": {
                map.colorLink = link as ColorLink;
                break;
            }
            case "boolean": {
                map.booleanLink = link as BooleanLink;
                break;
            }
            case "image": {
                map.imageLink = link as ImageLink;
                break;
            }
        }
        this._parameterMap$.next(this._maps);
    }

    public async saveVisualizerSettings(visualizerKey: string) {
        const file = await window.showSaveFilePicker();
        const writable = await file.createWritable({keepExistingData: false});
        const data = JSON.stringify(
            {
                key: visualizerKey,
                parameterMap: this._maps[visualizerKey]
            }, null, 2);
        await writable.write({data: data, type: "write"});
        await writable.close();
    }

    public async loadVisualizerSettings(visualizerKey: string): Promise<ErrorMessage | null> {
        const files = await window.showOpenFilePicker();
        if (files) {
            const file = await files[0].getFile();
            const fileReader = file.stream().getReader();
            let value = "";
            let readResult;

            do {
                readResult = await fileReader.read();
                if (!readResult.done) {
                    value += new TextDecoder().decode(readResult.value);
                }
            } while (!readResult || !readResult.done)

            let parameters;
            try {
                parameters = JSON.parse(value);
            } catch {
                return {text: "errors.invalidFile"};
            }

            if (parameters.key === visualizerKey) {
                const visualizer = _.find(new VisualizerDirectory().visualizers, (v) => v.label === visualizerKey);
                if (visualizer) {
                    this._maps[visualizerKey] = this.verifyLoadedMap(parameters.parameterMap, visualizer);
                    this._parameterMap$.next(this._maps);
                }
            } else {
                if (parameters.key) {
                    return {text: "errors.differentVisualizer", data: {name: parameters.key}};
                } else {
                    return {text: "errors.notParameters"};
                }
            }

        }
        return {text: "errors.loaded"};
    }
}