import {Neurosity} from "@neurosity/sdk";
import {NeurosityAdapter} from "./neurosity-adapter/NeurosityAdapter";
import {NeurosityDataProcessor} from "./neurosity-adapter/NeurosityDataProcessor";
import {OutputDataSource} from "./neurosity-adapter/OutputDataSource";
import {ScreenLinkTransmitter} from "./link/ScreenLinkTransmitter";
import {ScreenLinkReceiver} from "./link/ScreenLinkReceiver";
import {Settings} from "./services/Settings";
import {NeurosityDataWrapper} from "./neurosity-adapter/NeurosityDataWrapper";
import {NeurosityFileWriter} from "./neurosity-adapter/NeurosityFileWriter";
import {NeurosityFileReader} from "./neurosity-adapter/NeurosityFileReader";
import { OutputMapStore } from "./link/OutputMapStore";

export class Register {
    private static _neurosityAdapter: NeurosityAdapter;
    private static _outputDataSource: OutputDataSource;
    private static _dataProcessor: NeurosityDataProcessor;
    private static _screenLink: ScreenLinkTransmitter;
    private static _screenLinkReceiver: ScreenLinkReceiver;
    private static _neurosity: Neurosity;
    private static _settings: Settings;
    private static _neurosityDataWrapper: NeurosityDataWrapper;
    private static _neurosityFileWriter: NeurosityFileWriter;
    private static _neurosityFileReader: NeurosityFileReader;
    private static _outputMapStore: OutputMapStore;

    public static get neurosity(): Neurosity {
        return Register._neurosity ??= new Neurosity({autoSelectDevice: false});
    }

    public static get outputDataSource(): OutputDataSource {
        return Register._outputDataSource ??= new OutputDataSource(Register.neurosity, Register.neurosityDataWrapper);
    }

    public static get neurosityAdapter(): NeurosityAdapter {
        return Register._neurosityAdapter ??= new NeurosityAdapter(
            Register.neurosity,
            Register.outputDataSource,
            Register.settings,
        );
    }

    public static get dataProcessor(): NeurosityDataProcessor {
        return Register._dataProcessor ??= new NeurosityDataProcessor(Register.outputDataSource);
    }

    public static get screenLink(): ScreenLinkTransmitter {
        return Register._screenLink ??= new ScreenLinkTransmitter(Register.dataProcessor, Register.settings, Register.outputMapStore);
    }

    public static get screenLinkReceiver(): ScreenLinkReceiver {
        return Register._screenLinkReceiver ??= new ScreenLinkReceiver();
    }

    public static get settings(): Settings {
        return Register._settings ??= new Settings();
    }

    public static get neurosityDataWrapper(): NeurosityDataWrapper {
        return Register._neurosityDataWrapper ??= new NeurosityDataWrapper(Register.neurosity);
    }

    public static get neurosityFileWriter(): NeurosityFileWriter {
        return Register._neurosityFileWriter ??= new NeurosityFileWriter(Register.neurosityDataWrapper);
    }

    public static get neurosityFileReader(): NeurosityFileReader {
        return Register._neurosityFileReader ??= new NeurosityFileReader(Register.neurosityDataWrapper);
    }

    public static get outputMapStore() : OutputMapStore {
        return Register._outputMapStore ??= new OutputMapStore(Register.settings);
    }

}