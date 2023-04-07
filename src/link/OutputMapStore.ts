import {ColorModesLinks, ParameterLink, ParameterMaps} from "./ScreenLink";
import {VisualizerDirectory} from "../visualizers/VisualizerDirectory";
import * as _ from "lodash";
import {Settings} from "../services/Settings";
import {BehaviorSubject, debounceTime, Observable, Subject} from "rxjs";
import {forEach} from "lodash";
import {ColorModeNames} from "./ColorTransmission";

export class OutputMapStore {

    private readonly _maps: ParameterMaps;
    private readonly _parameterMap$: BehaviorSubject<ParameterMaps>;
    private readonly _storageKey = "parameterMaps_1.3"; // Up this version if you break compat
    private _settings: Settings;

    constructor(settings: Settings) {
        this._settings = settings;
        this._maps = this.readMapsFromStorage();
        this._parameterMap$ = new BehaviorSubject<ParameterMaps>(this._maps);

        this._parameterMap$.pipe(
            debounceTime(1000)
        ).subscribe( (maps) => {
            this.writeMapsToStorage(maps);
        });
    }

    private writeMapsToStorage(maps: ParameterMaps) {
        this._settings.setProp(this._storageKey, this._maps);
    }

    // factor this out of here
    private readMapsFromStorage() {
        const loadedMaps = this._settings.getProp<ParameterMaps>(this._storageKey);
        const visualizers = new VisualizerDirectory();
        const maps: ParameterMaps = {};
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
            const noValue = {manualValue: 0, outputKey: undefined};
            // needs to fill depending on what actually we have, right?
            if (loadedMap) {
                maps[v.label] = loadedMap;
            } else {
                const defaultColorLinks: ColorModesLinks = {};
                forEach(ColorModeNames, (colorMode) => {
                    defaultColorLinks[colorMode] = {
                        links: _.map([0,1,2], () => {return {...noValue};})
                    }
                });

                const newLinks = _.map(v.inputs, (i) => {
                    return {
                        propertyKey: i.propertyKey,
                        type: i.type,
                        colorLink: i.type === "color" ? {
                            colorMode: "rgb",
                            colorModeLinks: {...defaultColorLinks},
                        } : null,
                        numberLink: i.type === "number" ? {...noValue} : null,
                    } as ParameterLink
                })
                maps[v.label] = {links: newLinks};
            }
        });
        return maps;
    }

    public get parameterMap$(): Observable<ParameterMaps> {
        return this._parameterMap$;
    }

    public setParameterLink(visualizerKey: string, linkIndex: number, parameterMap: ParameterLink) {
        this._maps[visualizerKey].links[linkIndex] = parameterMap;
        this._parameterMap$.next(this._maps);
    }

}