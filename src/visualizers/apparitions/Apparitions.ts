import {colorInput, numberInput, visualizer} from "../VisualizerDirectory";
import {IVisualizer, IVisualizerColor} from "../IVisualizer";
import * as THREE from "three";
import firstInkShaderFile from './shaders/first_ink_shader.frag';
import vertexShaderFile from './shaders/vertex.vert';
import effectShaderFile from './shaders/effect_shader.frag';
import mixShaderFile from './shaders/mix_shader.frag';
import {
    ShaderMaterial,
    Vector2,
    Vector3,
    WebGLRenderTarget
} from "three";
import {noise2D} from "./Noise";


// This is a port to shaders of
// https://editor.p5js.org/StevesMakerspace/sketches/d0lPUJt8T


function wrap(value: number, from: number, to: number): number {
    return from + Math.abs((value - from) % (to - from));
}

@visualizer("Apparitions", "2d")
export class Apparitions implements IVisualizer {
    // Parameters
    @numberInput("Move noise", 0.001, 0.16)
    private noiseCoordOffset = 0.08;
    @numberInput("Color noise", 0.01, 0.32)
    private noiseColorOffset = 0.5;
    @numberInput("Move amplification", 1, 24)
    private pixelSkip = 12;
    @numberInput("Color amplification", 1, 18)
    private colorSkip = 7;
    @numberInput("Dry rate", -0.0028, 0.0048) // 0.0002
    private dryRate = 0.0012
    @numberInput("Paint amount", 0, 200)
    private paintDrop = 40;
    @numberInput("Pen Threshold", 0, 1)
    private penThreshold = 0;
    @numberInput("Pen Down", 0, 1)
    private penDown = 1;

    @colorInput("Pen Color")
    private penColor: IVisualizerColor = {red: 0, green: 0, blue: 0};


    private readonly renderer: THREE.WebGLRenderer;
    private readonly scene: THREE.Scene;
    private readonly firstInkScene: THREE.Scene;
    private readonly mixScene: THREE.Scene;

    private readonly camera: THREE.OrthographicCamera;

    private firstInkMaterial?: ShaderMaterial;
    private effectMaterial?: ShaderMaterial;
    private mixMaterial?: ShaderMaterial;
    private readonly width: number;
    private readonly height: number;
    private readonly firstInkTexture: WebGLRenderTarget;
    private readonly paintTexture: WebGLRenderTarget;

    private noiseOffsets = {
        x: Math.random() * 40000,
        y: Math.random() * 40000,
        r: Math.random() * 40000,
        g: Math.random() * 40000,
        b: Math.random() * 40000
    };

    private color = {
        r: Math.random() * 255,
        g: Math.random() * 255,
        b: Math.random() * 255,
    }
    private pos = {
        x: 0,
        y: 0
    };
    private previousPos = {
        x: 0,
        y: 0,
    }

    private frameId: number | null = null;

    constructor(width: number, height: number, element: Element) {
        this.width = width;
        this.height = height;

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.autoClear = false;
        this.renderer.setSize(width, height, false);

        element.appendChild(this.renderer.domElement);

        // Create all the textures
        const calcTextureParams = {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.NearestFilter,
            type: THREE.FloatType,
        };
        this.firstInkTexture = new THREE.WebGLRenderTarget(this.width, this.height, calcTextureParams);
        this.paintTexture = new THREE.WebGLRenderTarget(this.width, this.height, calcTextureParams);

        this.scene = new THREE.Scene();
        this.firstInkScene = new THREE.Scene();
        this.mixScene = new THREE.Scene();

        this.camera = new THREE.OrthographicCamera(-this.width / 2, this.width / 2, -this.height / 2, this.height / 2, 1, 1000);
        this.camera.position.set(0, 0, -100);
        this.camera.rotateX(Math.PI);

        this.previousPos.x = this.pos.x = Math.random() * width;
        this.previousPos.y = this.pos.y = Math.random() * width;
    }

    pause(): void {
        if (this.frameId !== null) {
            cancelAnimationFrame(this.frameId);
            this.frameId = null;
        }
    }

    start(): void {
        const renderLoop = (): void => {
            this.render();
            this.frameId = requestAnimationFrame(renderLoop);
        };

        this.frameId = requestAnimationFrame(renderLoop);
    }

    private addPaint(): void {
        this.previousPos.x = this.pos.x;
        this.previousPos.y = this.pos.y;

        this.noiseOffsets.r += this.noiseColorOffset;
        this.noiseOffsets.g += this.noiseColorOffset;
        this.noiseOffsets.b += this.noiseColorOffset;
        this.noiseOffsets.x += this.noiseCoordOffset;
        this.noiseOffsets.y += this.noiseCoordOffset;

        this.pos.x += Math.round((noise2D(this.noiseOffsets.x, 0)) * this.pixelSkip);
        this.pos.y += Math.round((noise2D(this.noiseOffsets.y, 0)) * this.pixelSkip);

        this.color.r += Math.round((noise2D(this.noiseOffsets.r, 0)) * this.colorSkip);
        this.color.g += Math.round((noise2D(this.noiseOffsets.g, 0)) * this.colorSkip);
        this.color.b += Math.round((noise2D(this.noiseOffsets.b, 0)) * this.colorSkip);
        this.color.r = wrap(this.color.r, 100, 255);
        this.color.g = wrap(this.color.g, 100, 255);
        this.color.b = wrap(this.color.b, 100, 255);
    }

    private render(): void {
        this.addPaint();

        // Apply the transformation of the firstInkMaterial
        this.firstInkMaterial!.uniforms!.iResolution = {value: new Vector2(this.width, this.height)};
        this.firstInkMaterial!.uniforms!.tex = {value: this.paintTexture.texture};
        this.firstInkMaterial!.uniforms!.dryRate = {value: this.dryRate};

        this.renderer.setRenderTarget(this.firstInkTexture);
        this.renderer.render(this.firstInkScene!, this.camera);

        // Mix the two ink textures
        this.mixMaterial!.uniforms!.firstTex = {value: this.firstInkTexture.texture};
        this.mixMaterial!.uniforms!.from = {value: new Vector2(Math.abs(this.pos.x % this.width), Math.abs(this.pos.y % this.height))};
        this.mixMaterial!.uniforms!.to = {value: new Vector2(Math.abs(this.previousPos.x % this.width), Math.abs(this.previousPos.y % this.height))};
        //this.mixMaterial!.uniforms!.color = {value: new Vector3(this.color.r / 255, this.color.g / 255, this.color.b / 255)};
        this.mixMaterial!.uniforms!.color = {value: new Vector3(this.penColor.red, this.penColor.green, this.penColor.blue)};
        this.mixMaterial!.uniforms!.paintDrop = {value: this.paintDrop};
        this.mixMaterial!.uniforms!.resolution = {value: new Vector2(this.width, this.height)};
        this.mixMaterial!.uniforms!.penDown = {value: this.penDown - this.penThreshold};
        this.renderer.setRenderTarget(this.paintTexture);
        this.renderer.render(this.mixScene, this.camera);

        // Apply the texture to the screen
        this.effectMaterial!.uniforms!.tex = {value: this.paintTexture.texture};
        this.renderer.setRenderTarget(null);
        this.renderer.render(this.scene, this.camera);
    }

    async load(): Promise<void> {
        const plane = new THREE.PlaneGeometry(this.width, this.height, 1, 1);
        const fileLoader = new THREE.FileLoader();
        const vertexShader = await fileLoader.loadAsync(vertexShaderFile) as string;
        const fragmentShader = await fileLoader.loadAsync(firstInkShaderFile) as string;
        const copyShader = await fileLoader.loadAsync(effectShaderFile) as string;
        const mixShader = await fileLoader.loadAsync(mixShaderFile) as string;

        this.firstInkMaterial = new THREE.ShaderMaterial({
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            depthTest: false,
        });

        this.effectMaterial = new THREE.ShaderMaterial({
            vertexShader: vertexShader,
            fragmentShader: copyShader,
            depthTest: false,
        });
        this.mixMaterial = new THREE.ShaderMaterial({
            vertexShader: vertexShader,
            fragmentShader: mixShader,
            depthTest: false,
        })

        this.firstInkScene.add(new THREE.Mesh(plane, this.firstInkMaterial));
        this.mixScene.add(new THREE.Mesh(plane, this.mixMaterial));
        this.scene.add(new THREE.Mesh(plane, this.effectMaterial));
    }
}
