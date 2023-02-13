import {Observable} from "rxjs";
import {Calm} from "@neurosity/sdk/dist/esm/types/calm";
import {PowerByBand} from "@neurosity/sdk/dist/esm/types/brainwaves";
import {Focus} from "@neurosity/sdk/dist/esm/types/focus";

export interface INeurosityDataSource {
    get powerByBand$(): Observable<PowerByBand>;
    get calm$(): Observable<Calm>;
    get focus$(): Observable<Focus>;
}