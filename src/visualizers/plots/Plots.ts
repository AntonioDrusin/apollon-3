import {numberInput, visualizer} from "../VisualizerDirectory";
import {IVisualizer} from "../IVisualizer";
import * as d3 from 'd3';

@visualizer("Plots", "2d")
export class Plots implements IVisualizer {
    @numberInput("Plot Uno", 0.0, 1.0)
    private noiseCoordOffset = 0.50;


    private svg: d3.Selection<SVGGElement, unknown, null, undefined>;
    private xScale: d3.ScaleLinear<number, number>;
    private yScale: d3.ScaleLinear<number, number>;
    private margin = { top: 10, right: 30, bottom: 30, left: 40 };
    private width: number;
    private height: number;
    private effectiveWidth: number;
    private effectiveHeight: number;
    private data: number[];
    private frameId: number | null = null;
    private timer: NodeJS.Timer | null = null;

    constructor(width: number, height: number, element: Element) {
        this.width = width;
        this.height = height;
        this.effectiveWidth = width - this.margin.left - this.margin.right;
        this.effectiveHeight = height - this.margin.top - this.margin.bottom;

        // Initialize data with random values
        this.data = Array.from({ length: 800 }, () => (0));

        // Select the element and append an SVG
        this.svg = d3.select(element)
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

        // Initialize scales
        this.xScale = d3.scaleLinear()
            .domain([0, 800])
            .range([0, this.effectiveWidth]);

        this.yScale = d3.scaleLinear()
            .domain([0, 1.0])
            .range([0, -this.effectiveHeight]);

        // Draw initial graph
        this.draw();
    }

    load(): Promise<void> {
        return Promise.resolve();
    }
    render(): void {

        this.data.push(this.noiseCoordOffset);
        this.data.shift();
        this.redraw();
    }

    start(): void {
        // Ensure any existing interval is cleared before starting a new one
        if (this.frameId !== null) {
            clearInterval(this.frameId);
        }

        // Set up an interval to update the visualization at approximately 60 times per second
        this.timer = setInterval(() => {
            this.render();
        }, 1000 / 60);  // Approximately 16.67 milliseconds per update
    }

    pause(): void {
        // Clear the interval if it is set
        if (this.timer !== null) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    private lineGenerator = d3.line<number>()
        .x((d, i) => this.xScale(i)) // Using index i for the x-coordinate
        .y(d => this.yScale(d)) // Using data value d for the y-coordinate
        .curve(d3.curveBasis); // Optional: makes the line smooth


    private draw(): void {
        this.svg.append('g')
            .attr('transform', `translate(0, ${this.effectiveHeight})`)
            .attr('class', 'x-axis')
            .call(d3.axisBottom(this.xScale));

        this.svg.append('g')
            .attr('class', 'y-axis')
            .call(d3.axisLeft(this.yScale));
    }

    private redraw(): void {

        this.svg.select('path')
            .datum(this.data) // Rebind data to the path
            .attr('d', this.lineGenerator); // Redraw line


        //  // Rebind the data to the circles, updating positions and adding or removing elements as necessary
        // const circles = this.svg.selectAll('circle')
        //     .data(this.data)
        //     .join(
        //         enter => enter.append('circle').attr('r', 5).style('fill', '#d04a35'),
        //         update => update,
        //         exit => exit.remove()
        //     );
        //
        // circles
        //     .attr('cx', (d,i) => this.xScale(i))
        //     .attr('cy', d => this.yScale(d));
    }
}