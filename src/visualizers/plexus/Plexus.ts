import {numberInput, visualizer} from "../VisualizerDirectory";
import {IVisualizer} from "../IVisualizer";
import * as THREE from "three";
import vertexShaderFile from './shaders/vertex.vert';
import effectShaderFile from './shaders/effect_shader.frag';
import {
    ShaderMaterial, Vector2
} from "three";


// This is a port to apollon of this shader
// https://www.shadertoy.com/view/lldyDs


@visualizer("Plexus", "2d")
export class Plexus implements IVisualizer {
    // Parameters
    @numberInput("Amplitude", 0, 1) // 0, 200
    private amplitude: number = 0.5

    @numberInput("Zoom", 0.01, 1) // 0, 200
    private zoom: number = 1;

    private readonly renderer: THREE.WebGLRenderer;
    private readonly scene: THREE.Scene;
    private readonly camera: THREE.OrthographicCamera;
    private effectMaterial?: ShaderMaterial;

    private readonly width: number;
    private readonly height: number;

    private frameId: number | null = null;
    private readonly fileLoader: THREE.FileLoader;


    // Shader inputs
    private performanceStart: number = 0;

    constructor(width: number, height: number, element: Element) {
        this.width = width;
        this.height = height;

        this.fileLoader = new THREE.FileLoader();
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.autoClear = false;
        this.renderer.setSize(width, height, false);

        element.appendChild(this.renderer.domElement);

        this.scene = new THREE.Scene();

        this.camera = new THREE.OrthographicCamera(-this.width / 2, this.width / 2, -this.height / 2, this.height / 2, 1, 1000);
        this.camera.position.set(0, 0, -100);
        this.camera.rotateX(Math.PI);

        this.performanceStart = performance.now();
    }

    pause(): void {
        if (this.frameId !== null) {
            cancelAnimationFrame(this.frameId);
            this.frameId = null;
        }
        this.performanceStart -= performance.now();
    }

    start(): void {
        const renderLoop = (): void => {
            this.render();
            this.frameId = requestAnimationFrame(renderLoop);
        };

        this.frameId = requestAnimationFrame(renderLoop);
        this.performanceStart += performance.now();
    }

    private render(): void {

        //ERROR: 0:99: 'x' :  field selection requires structure, vector, or interface block on left hand side

        // Setting parameters
        this.effectMaterial!.uniforms!.iResolution = {value: new Vector2(this.width, this.height)};
        this.effectMaterial!.uniforms!.iTime = {value: (performance.now() - this.performanceStart)/1000};
        this.effectMaterial!.uniforms!.iAmplitude = {value: this.amplitude};
        this.effectMaterial!.uniforms!.iZoom = {value: this.zoom};


        this.renderer.setRenderTarget(null);
        this.renderer.render(this.scene, this.camera);
    }

    private async getMaterial(shaderFileName: string, vertexShader: string): Promise<THREE.ShaderMaterial> {
        const fragmentShader = await this.fileLoader.loadAsync(shaderFileName) as string;
        return new THREE.ShaderMaterial({
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            depthTest: false,
        });
    }

    async load(): Promise<void> {
        const plane = new THREE.PlaneGeometry(this.width, this.height, 1, 1);
        const vertexShader = await this.fileLoader.loadAsync(vertexShaderFile) as string;
        this.effectMaterial = await this.getMaterial(effectShaderFile, vertexShader);
        this.scene.add(new THREE.Mesh(plane, this.effectMaterial));
    }
}
