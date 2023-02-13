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

    public static get neurosity(): Neurosity {
        if (!Register._neurosity) {
            Register._neurosity = new Neurosity({autoSelectDevice: false});
        }
        return Register._neurosity;
    }

    public static get outputDataSource(): OutputDataSource {
        if (!Register._outputDataSource) {
            Register._outputDataSource = new OutputDataSource(Register.neurosity, Register.neurosityDataWrapper);
        }
        return Register._outputDataSource;
    }

    public static get neurosityAdapter(): NeurosityAdapter {
        if (!Register._neurosityAdapter) {
            Register._neurosityAdapter = new NeurosityAdapter(
                Register.neurosity,
                Register.outputDataSource,
                Register.settings,
            );
        }
        return Register._neurosityAdapter;
    }

    public static get dataProcessor(): NeurosityDataProcessor {
        if (!Register._dataProcessor) {
            Register._dataProcessor = new NeurosityDataProcessor(Register.outputDataSource);
        }
        return Register._dataProcessor;
    }

    public static get screenLink(): ScreenLinkTransmitter {
        if (!Register._screenLink) {
            Register._screenLink = new ScreenLinkTransmitter(Register.dataProcessor, Register.settings);
        }
        return Register._screenLink;
    }

    public static get screenLinkReceiver(): ScreenLinkReceiver {
        if (!Register._screenLinkReceiver) {
            Register._screenLinkReceiver = new ScreenLinkReceiver();
        }
        return Register._screenLinkReceiver;
    }

    public static get settings(): Settings {
        if (!Register._settings) {
            Register._settings = new Settings();
        }
        return Register._settings;
    }

    public static get neurosityDataWrapper(): NeurosityDataWrapper {
        if (!Register._neurosityDataWrapper) {
            Register._neurosityDataWrapper = new NeurosityDataWrapper(Register.neurosity);
        }
        return Register._neurosityDataWrapper;
    }

    public static get neurosityFileWriter(): NeurosityFileWriter {
        if (!Register._neurosityFileWriter) {
            Register._neurosityFileWriter = new NeurosityFileWriter(Register.neurosityDataWrapper);
        }
        return Register._neurosityFileWriter;
    }

    public static get neurosityFileReader(): NeurosityFileReader {
        if (!Register._neurosityFileReader) {
            Register._neurosityFileReader = new NeurosityFileReader(Register.neurosityDataWrapper);
        }
        return Register._neurosityFileReader;
    }

}