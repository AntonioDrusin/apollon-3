import {InputProcessorParameters} from "./NeurosityDataProcessor";
import {Settings} from "../services/Settings";
import {Register} from "../Register";
import {interval} from "rxjs";


class InputRange {
    public max: number = 0;
    public min: number = 0;

    constructor(max: number = -1000000000, min: number = 1000000000) {
        this.max = max;
        this.min = min;
    }

    public next(n: number) {
        if (n > this.max) this.max = n;
        if (n < this.min) this.min = n;
    }

    public merge(range: InputRange): InputRange {
        return new InputRange(Math.max(range.max, this.max), Math.min(range.min, this.min));
    }

    public adjustTo(desired: InputRange) {
        this.max += (desired.max - this.max)/20;
        this.min += (desired.min - this.min)/20;
    }
}

export class InputProcessor {
    _parameters: InputProcessorParameters;
    _fir: number[];
    _settings: Settings;
    _inputRanges: InputRange[] = [];
    _currentInputRange: InputRange = new InputRange();
    _currentAutoScale: InputRange = new InputRange();
    _desiredAutoScale: InputRange = new InputRange();
    _hasValues = false;
    private readonly _settingsKey: string;
    private readonly _autoscalerSettingsKey: string;

    constructor(key: string) {
        this._settings = Register.settings;
        this._settingsKey = `InputProcessor[${key}]`;
        this._autoscalerSettingsKey = `InputProcessorScale[${key}]`;
        this._fir = [];
        const params = this._settings.getProp<InputProcessorParameters>(this._settingsKey);
        this._parameters = params ?? {
            firLength: 0,
            highClamp: 1,
            lowClamp: 0,
            autoscaling: true,
            autoscalingPeriodSeconds: 10
        };

        const saved = this._settings.getProp<InputRange>(this._autoscalerSettingsKey);
        if ( saved ) {
            this._currentInputRange = new InputRange(saved.max, saved.min);
            this._currentAutoScale = new InputRange(saved.max, saved.min);
            this._desiredAutoScale = new InputRange(saved.max, saved.min);
            this._inputRanges.push(new InputRange(saved.max, saved.min));
        }

        interval(1000).subscribe(() => {
            this._inputRanges.push(this._currentInputRange);
            this._currentInputRange = new InputRange();
            if (this._inputRanges.length > this._parameters.autoscalingPeriodSeconds ) {
                this._inputRanges.splice(0, this._inputRanges.length - this._parameters.autoscalingPeriodSeconds);
            }
            this._desiredAutoScale = this._inputRanges.reduce((a,b) => a.merge(b) , new InputRange());
            this._settings.setProp(this._autoscalerSettingsKey, this._currentAutoScale);
        });
    }

    public setParameters(value: InputProcessorParameters) {
        this._parameters = {...this._parameters, ...value};
        this._settings.setProp(this._settingsKey, this._parameters);
    }

    public getParameters(): InputProcessorParameters {
        return this._parameters;
    }

    // Must return a value between 0 and 1
    public next(input: number): number {
        this._hasValues = true;
        this._currentInputRange.next(input);
        const value = this.clamp(input);
        return this.fir(value);
    }

    private fir(value: number) {
        if (this._parameters.firLength === 0) {
            return value;
        } else {
            this._fir.push(value)
            if (this._fir.length > this._parameters.firLength) {
                this._fir.splice(0, this._fir.length - this._parameters.firLength);
            }
            let divider = 0;
            let total = 0;

            this._fir.forEach((v, i) => {
                total += v * i;
                divider += i;
            });
            return total / divider;
        }
    }

    private clamp(input: number) {
        this._currentAutoScale.adjustTo(this._desiredAutoScale);

        let high = this._parameters.highClamp;
        let low = this._parameters.lowClamp;
        if ( this._parameters.autoscaling) {
            high = this._currentAutoScale.max;
            low = this._currentAutoScale.min;
        }
        input = Math.min(input, high);
        input = Math.max(input, low);
        const range = high - low;
        return (input - low) / range;
    }
}
