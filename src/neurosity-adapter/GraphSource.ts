import {Observable} from "rxjs";
import {NeurosityData} from "./NeurosityDataSource";

export interface GraphSource {
    get data$(): Observable<NeurosityData | null>;
}