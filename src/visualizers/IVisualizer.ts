export interface IVisualizer {
    load(): Promise<void>;
    start(): void;
    pause(): void;
}

// Colors are between 0 and 1.
export interface IVisualizerColor {
    red: number;
    green: number;
    blue: number;
}