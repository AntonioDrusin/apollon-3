import Graphics from "p5";
import {numberInput, Visualizer, visualizer} from "../VisualizerDirectory";

@visualizer("Circles", "2d")
export class Circles implements Visualizer {

    @numberInput("Border Thickness", 0, 10)
    border: number = 0;
    @numberInput("Upper Diameter", 10, 200)
    leftDiameter: number = 10;
    @numberInput("Lower Diameter", 10, 200)
    rightDiameter: number = 10;

    paint(width: number, height: number, g: Graphics): void {
        g.background(0, 0, 0);

        let mul = width / 1920;

        g.fill(100, 120, 100);
        g.strokeWeight(this.border);
        g.stroke(200, 200, 200);
        g.circle(mul * 800, mul * 100, mul * this.leftDiameter);
        g.circle(mul * 800, mul * 500, mul * this.rightDiameter);

    }
}