import {NeurosityAdapter} from "./NeurosityAdapter";
import {NeurosityDataProcessor} from "./NeurosityDataProcessor";
import {ScreenLinkTransmitter, ScreenLinkReceiver} from "../link/ScreenLink";
import {Neurosity} from "@neurosity/sdk";
import {NeurosityDataSource} from "./NeurosityDataSource";

export class Register {
    private static _neurosityAdapter: NeurosityAdapter;
    private static _neurosityDataSource: NeurosityDataSource;
    private static _dataProcessor: NeurosityDataProcessor;
    private static _screenLink: ScreenLinkTransmitter;
    private static _screenLinkReceiver: ScreenLinkReceiver;
    private static _neurosity: Neurosity;

    public static get neurosity(): Neurosity {
        if (!Register._neurosity) {
            Register._neurosity = new Neurosity({autoSelectDevice: false});
        }
        return Register._neurosity;
    }

    public static get neurosityDataSource(): NeurosityDataSource {
        if (!Register._neurosityDataSource) {
            Register._neurosityDataSource = new NeurosityDataSource(Register.neurosity);
        }
        return Register._neurosityDataSource;
    }

    public static get neurosityAdapter(): NeurosityAdapter {
        if (!Register._neurosityAdapter) {
            Register._neurosityAdapter = new NeurosityAdapter(
                Register.neurosity,
                Register.neurosityDataSource,
                Register.dataProcessor
            );
        }
        return Register._neurosityAdapter;
    }

    public static get dataProcessor(): NeurosityDataProcessor {
        if (!Register._dataProcessor) {
            Register._dataProcessor = new NeurosityDataProcessor(Register.neurosityDataSource);
        }
        return Register._dataProcessor;
    }

    public static get screenLink(): ScreenLinkTransmitter {
        if (!Register._screenLink) {
            Register._screenLink = new ScreenLinkTransmitter(Register.dataProcessor);
        }
        return Register._screenLink;
    }

    public static get screenLinkReceiver(): ScreenLinkReceiver {
        if (!Register._screenLinkReceiver) {
            Register._screenLinkReceiver = new ScreenLinkReceiver();
        }
        return Register._screenLinkReceiver;
    }


}