import Graphics from "p5";
import {numberInput, Visualizer, visualizer} from "../Visualizers";

@visualizer("Squares", "2d")
export class Squares implements Visualizer {

    @numberInput("Left Side", 10, 20)
    leftSide: number = 10;
    @numberInput("Right Side", 10, 20)
    rightSide: number = 10;
    @numberInput("Top Side", 10, 20)
    topSide: number = 10;
    @numberInput("Bottom Side", 10, 20)
    bottomSide: number = 10;

    paint(width: number, height: number, g: Graphics): void {
        let mul = width / 1920;

        g.noFill();
        g.stroke(73, 55, 138);
        g.strokeWeight(1);

        g.beginShape();
        let x = 20;
        let y = 30;
        g.vertex(mul * x, mul * y);
        x = x + this.topSide;
        g.vertex(mul * x, mul * y);
        y = y + this.leftSide;
        g.vertex(mul * x, mul * y);
        x = x - this.bottomSide;
        g.vertex(mul * x, mul * y);
        y = y - this.rightSide;
        g.vertex(mul * x, mul * y);
        g.endShape("close");
    }
}
