import {numberInput, visualizer} from "../VisualizerDirectory";
import {IVisualizer} from "../IVisualizer";

@visualizer("Squares", "2d")
export class Squares implements IVisualizer {

    @numberInput("Left Side", 10, 20)
    leftSide: number = 10;
    @numberInput("Right Side", 10, 20)
    rightSide: number = 10;
    @numberInput("Top Side", 10, 20)
    topSide: number = 10;
    @numberInput("Bottom Side", 10, 20)
    bottomSide: number = 10;

    init(width: number, height: number, element: Element): void {
    }

    clear() {}
}
