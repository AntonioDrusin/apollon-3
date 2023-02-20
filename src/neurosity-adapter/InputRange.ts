export class InputRange {
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
        this.max += (desired.max - this.max) / 20;
        this.min += (desired.min - this.min) / 20;
    }
}