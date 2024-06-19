import {Observable} from "rxjs";
import {NeurosityData} from "./OutputDataSource";

export interface GraphSource {
    get data$(): Observable<NeurosityData | null>;
    resetData(): void;
}