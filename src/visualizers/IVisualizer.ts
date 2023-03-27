export interface IVisualizer {
    load(): Promise<void>;
    start(): void;
    pause(): void;
}
