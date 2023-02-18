import {KeysOfNeurosityData, NeurosityData, NeurosityDataKeys, OutputDataSource} from "./OutputDataSource";
import {filter, map, interval, Observable, withLatestFrom, connectable, Subject} from "rxjs";
import {InputProcessor} from "./InputProcessor";
import {GraphSource} from "./GraphSource";

export interface InputProcessorParameters {
    firLength: number;
    lowClamp: number;
    highClamp: number;
    autoscaling: boolean;
    autoscalingPeriodSeconds: number;
    autoMax: number;
}

export class NeurosityDataProcessor implements GraphSource {
    private readonly _dataSource: OutputDataSource;
    private readonly _data$: Observable<NeurosityData>;
    private readonly _processors: { [key in KeysOfNeurosityData]: InputProcessor };

    constructor(dataSource: OutputDataSource) {
        this._dataSource = dataSource;

        this._processors = NeurosityDataKeys.reduce((o: any, key) => {
            o[key] = new InputProcessor(key);
            return o;
        }, {}) as any;

        const timer = interval(1000 / 60);
        const source = timer.pipe(
            withLatestFrom(this._dataSource.data$),
            map(([_, data]) => {
                if (data) {
                    const newData: any = {};
                    NeurosityDataKeys.forEach((key) => {
                        newData[key] = this._processors[key].next(data[key])
                    });
                    return newData;
                }
                return null;
            }),
            filter((data) => !!data)
        );
        const c = connectable(source, {connector: () => new Subject(), resetOnDisconnect: false});
        c.connect();
        this._data$ = c;
    }

    public getInputProcessor(key: KeysOfNeurosityData): InputProcessor {
        return this._processors[key];
    }

    get data$(): Observable<NeurosityData> {
        return this._data$;
    }

    get preData$(): Observable<NeurosityData | null> {
        return this._dataSource.data$;
    }
}