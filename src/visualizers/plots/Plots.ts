import {colorInput, numberInput, selectOption, visualizer} from "../VisualizerDirectory";
import {IVisualizer, IVisualizerColor} from "../IVisualizer";
import * as d3 from 'd3';

@visualizer("Plots", "2d")
export class Plots implements IVisualizer {
    @numberInput("Plot 0", 0.0, 1.0)
    private plot_0 = 0.50;
    @numberInput("Plot 1", 0.0, 1.0)
    private plot_1 = 0.50;
    @numberInput("Plot 2", 0.0, 1.0)
    private plot_2 = 0.50;
    @numberInput("Plot 3", 0.0, 1.0)
    private plot_3 = 0.50;
    @selectOption("Number of plots", ["1", "2", "3", "4"])
    private numberOfPlots: number = 2;
    @selectOption("Plot type", ["Line", "Fill"])
    private plotType: number = 0;

    @colorInput("Color 0")
    private plotColor_0: IVisualizerColor = {red: 1, green: 1, blue: 1};
    @colorInput("Color 1")
    private plotColor_1: IVisualizerColor = {red: 1, green: 1, blue: 1};
    @colorInput(" Color 2")
    private plotColor_2: IVisualizerColor = {red: 1, green: 1, blue: 1};
    @colorInput("Color 3")
    private plotColor_3: IVisualizerColor = {red: 1, green: 1, blue: 1};
    @colorInput("Background Color")
    private backgroundColor: IVisualizerColor = {red: 1, green: 1, blue: 1};
    @colorInput("Label Color")
    private labelColor: IVisualizerColor = {red: 1, green: 1, blue: 1};
    @colorInput("Axis Color")
    private axisColor: IVisualizerColor = {red: 1, green: 1, blue: 1};


    private plotSeconds = 15;
    private element: Element;
    private sampleRate = 60;
    private dataLen = this.plotSeconds * this.sampleRate;

    private svg: d3.Selection<SVGGElement, unknown, null, undefined>;
    private xScale?: d3.ScaleLinear<number, number>;
    private axisScale?: d3.ScaleLinear<number, number>;
    private yScale?: d3.ScaleLinear<number, number>;
    private margin = {top: 10, right: 30, bottom: 30, left: 40};
    private effectiveWidth: number;
    private effectiveHeight: number;
    private data: number[][];
    private frameId: number | null = null;
    private timer: NodeJS.Timer | null = null;

    private currentNumberOfPlots: number = 0;

    constructor(width: number, height: number, element: Element) {
        this.element = element;
        this.effectiveWidth = width - this.margin.left - this.margin.right;
        this.effectiveHeight = height - this.margin.top - this.margin.bottom;

        // Initialize data with random values
        this.data = Array.from(
            {length: 4},
            () => Array.from({length: this.dataLen}, () => (0))
        );

        // Select the element and append an SVG
        this.svg = d3.select(element)
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

        this.currentNumberOfPlots = this.numberOfPlots+1;

        this.calculateScales();
        // Draw initial graph
        this.draw();
    }

    calculateScales(): void {
        // Initialize scales
        this.xScale = d3.scaleLinear()
            .domain([0, this.dataLen])
            .range([0, this.effectiveWidth]);

        this.axisScale = d3.scaleLinear()
            .domain([0, this.dataLen / this.sampleRate])
            .range([0, this.effectiveWidth]);

        this.yScale = d3.scaleLinear()
            .domain([0, 1.0])
            .range([0, -this.effectiveHeight / this.currentNumberOfPlots]);
    }

    load(): Promise<void> {
        return Promise.resolve();
    }

    render(): void {

        if ( this.currentNumberOfPlots !== this.numberOfPlots+1 ) {
            this.currentNumberOfPlots = this.numberOfPlots+1;
            this.calculateScales();
            this.draw();
        }

        this.data[0].push(this.plot_0);
        this.data[1].push(this.plot_1);
        this.data[2].push(this.plot_2);
        this.data[3].push(this.plot_3);
        for (let t = 0; t < 4; t++) {
            this.data[t].shift();
        }
        this.redraw();
    }

    start(): void {
        if (this.frameId !== null) {
            clearInterval(this.frameId);
        }

        this.timer = setInterval(() => {
            this.render();
        }, 1000 / this.sampleRate);
    }

    pause(): void {
        // Clear the interval if it is set
        if (this.timer !== null) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    private lineGenerator = d3.line<number>()
        .x((d, i) => this.xScale!(i))
        .y(d => this.yScale!(d))
        .curve(d3.curveBasis);




    private draw(): void {
        const height = this.effectiveHeight / this.currentNumberOfPlots;
        this.svg.selectAll('g').remove();

        for ( let i=0; i<this.currentNumberOfPlots; i++) {
            const group = this.svg.append('g')
                .attr('transform', `translate(0, ${(i+1) * height})`)
                .attr('class', `x-axis-${i}`)
                .call(d3.axisBottom(this.axisScale!)
                    .tickFormat(d => `${d.valueOf().toFixed(0)} s`)
                );

            group.append('path')
                .attr('class', `line line-${i}`);
        }
    }

    private redraw(): void {
        const colors = [this.plotColor_0,this.plotColor_1,this.plotColor_2,this.plotColor_3];

        d3.select(this.element).style('background-color', this.formatColor(this.backgroundColor));
        d3.select('g').attr('stroke', this.formatColor(this.labelColor));

        for ( let i=0; i<this.currentNumberOfPlots; i++) {
            this.svg.select(`.x-axis-${i}`).selectAll('path.domain, g.tick line')
                .style('stroke', this.formatColor(this.axisColor));

            if (this.plotType === 0) {
                this.svg.select(`path.line-${i}`)
                    .datum(this.data[i])
                    .attr('d', this.lineGenerator)
                    .attr('stroke', this.formatColor(colors[i]))
                    .attr('stroke-width', 2)
                    .attr('fill', 'none');
            } else {
                const areaGenerator = d3.area<number>()
                    .x((d, i) => this.xScale!(i))
                    .y0(this.yScale!(0))
                    .y1(d => this.yScale!(d));

                this.svg.select(`path.line-${i}`)
                    .datum(this.data[i])
                    .attr('d', areaGenerator)
                    .attr('fill', this.formatColor(colors[i]))
                    .attr('stroke', 'none'); // Optionally remove stroke for area fills
            }
        }
    }

    private formatColor(color: IVisualizerColor): string {
        const red = Math.round(color.red * 255);
        const green = Math.round(color.green * 255);
        const blue = Math.round(color.blue * 255);
        return `rgb(${red}, ${green}, ${blue})`;
    }

}
