import {numberInput, visualizer} from "../VisualizerDirectory";
import {IVisualizer} from "../IVisualizer";
import p5 from "p5";

@visualizer("Circles", "2d")
export class Circles implements IVisualizer {

    @numberInput("Border Thickness", 0, 10)
    border: number = 0;
    @numberInput("Upper Diameter", 10, 200)
    leftDiameter: number = 10;
    @numberInput("Lower Diameter", 10, 200)
    rightDiameter: number = 10;
    private _p5?: p5;

    private _width: number = 1920;
    private _height: number = 1080;

    init(width: number, height: number, element: Element): void {
        this._p5 = new p5((p: p5) => {
            p.setup = () => {
                // See docs for positioning canvas
                p.createCanvas(p.displayWidth, p.displayHeight).parent(element);
                this._width = p.displayWidth;
                this._height = p.displayHeight;
            };

            p.draw = () => {
                p.background(0, 0, 0);

                let mul = this._width / 1920;

                p.fill(100, 120, 100);
                p.strokeWeight(this.border);
                p.stroke(200, 200, 200);
                p.circle(mul * 800, mul * 100, mul * this.leftDiameter);
                p.circle(mul * 800, mul * 500, mul * this.rightDiameter);
            }
        });
    }

    clear(): void {
        this._p5?.remove()
    }
}