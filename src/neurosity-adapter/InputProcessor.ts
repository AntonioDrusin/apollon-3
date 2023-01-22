import {InputProcessorParameters, PartialInputProcessorParameters} from "./NeurosityDataProcessor";

export class InputProcessor {
    _parameters: InputProcessorParameters;
    _fir: number[];

    constructor() {
        this._parameters = {firLength: 0, highClamp: 1, lowClamp: 0};
        this._fir = [];
    }

    public setParameters(value: PartialInputProcessorParameters) {
        this._parameters = {...this._parameters, ...value};
    }

    // Must return a value between 0 and 1
    public next(input: number): number {
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

            this._fir.map((v, i) => {
                total += v * i;
                divider += i;
            });
            return total/divider;
        }
    }

    private clamp(input: number) {
        input = Math.min(input, this._parameters.highClamp);
        input = Math.max(input, this._parameters.lowClamp);
        const range = this._parameters.highClamp - this._parameters.lowClamp;
        return (input - this._parameters.lowClamp) / range;
    }
}