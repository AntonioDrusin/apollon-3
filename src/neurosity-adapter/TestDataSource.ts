import {GraphSource} from "./GraphSource";
import {interval, map, Observable} from "rxjs";
import {NeurosityData} from "./OutputDataSource";

export class TestDataSource implements GraphSource {
    private readonly frequency = 60; // 60 Hz data generation
    private readonly dataStream$: Observable<NeurosityData | null>;

    constructor() {
        this.dataStream$ = interval(1000 / this.frequency).pipe(
            map(tick => this.generateData(tick))
        );
    }

    resetData(): void {
    }

    get data$(): Observable<NeurosityData | null> {
        return this.dataStream$;
    }

    private generateData(tick: number): NeurosityData {
        const radians = (tick / this.frequency) * 2 * Math.PI;
        return {
            alpha: Math.sin(radians),
            beta: Math.sin(radians + Math.PI / 4),
            gamma: Math.sin(radians + Math.PI / 2),
            theta: Math.sin(radians + 3 * Math.PI / 4),
            delta: this.triangularWave(radians),
            focus: this.triangularWave(radians + Math.PI / 4),
            calm: this.triangularWave(radians + Math.PI / 2),
            valence: this.triangularWave(radians + 3 * Math.PI / 4),
            vigilance: this.sawtoothWave(radians),
            engagement: this.sawtoothWave(radians + Math.PI / 4),
            workload: this.sawtoothWave(radians + Math.PI / 2)
        };
    }

    private triangularWave(x: number): number {
        const wave = x % (2 * Math.PI);
        return wave < Math.PI ? 2 * (wave / Math.PI) - 1 : 1 - 2 * ((wave - Math.PI) / Math.PI);
    }

    private sawtoothWave(x: number): number {
        return 2 * ((x / Math.PI) % 1) - 1;
    }
}