export interface IVisualizer {
    init(width: number, height: number, element: Element): void;

    clear(): void;
}