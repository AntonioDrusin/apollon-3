import Graphics from "p5";
import {numberInput, Visualizer, visualizer} from "../Visualizers";

@visualizer("Circles", "2d")
export class Circles implements Visualizer {

    @numberInput("Border Thickness", 0, 5)
    border: number = 0;
    @numberInput("Left Diameter", 10, 100)
    leftDiameter: number = 10;
    @numberInput("Right Diameter", 10, 100)
    rightDiameter: number = 10;

    paint(width: number, height: number, g: Graphics): void {
        let mul = width / 1920;

        g.fill(100, 120, 100);
        g.strokeWeight(width);
        g.stroke(200, 100, 200);
        g.circle(mul*20, mul*20, mul*this.leftDiameter);
        g.circle(mul*20, mul*60, mul*this.rightDiameter);

    }
}