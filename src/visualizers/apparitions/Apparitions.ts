import {numberInput, visualizer} from "../VisualizerDirectory";
import {IVisualizer} from "../IVisualizer";
import * as THREE from "three";
import firstInkShaderFile from './shaders/first_ink_shader.frag';
import vertexShaderFile from './shaders/vertex.vert';
import effectShaderFile from './shaders/effect_shader.frag';
import {
    Mesh,
    PlaneGeometry,
    ShaderMaterial,
    Vector2, Vector3, Vector4,
    WebGLRenderTarget
} from "three";
import {noise2D} from "./Noise";

// https://editor.p5js.org/StevesMakerspace/sketches/d0lPUJt8T
//
// TODO:
//
// Match ink values to the p5 version.
// Add runny colors false
// Name shaders and textures correctly
// Shorten functions


function wrap(value: number, from: number, to: number): number {
    return from + Math.abs((value - from) % (to-from));
}

@visualizer("Apparitions", "2d")
export class Apparitions implements IVisualizer {
    @numberInput("X coord", 0, 1.0)
    posX: number = 0;

    @numberInput("Y coord", 0, 1.0)
    posY: number = 0;

    // Parameters
    private noiseCoordOffset = 0.08;
    private noiseColorOffset = 0.5;
    private pixelSkip = 12;
    private colorSkip = 7;
    private dryRate = 0.0012
    private paintDrop = 40;



    private readonly renderer: THREE.WebGLRenderer;
    private scene?: THREE.Scene;
    private bufferScene?: THREE.Scene;
    private camera?: THREE.OrthographicCamera;

    private frameId: number | null = null;
    private material?: ShaderMaterial;
    private copy_material?: ShaderMaterial;
    private readonly width: number;
    private readonly height: number;
    private mesh?: Mesh<PlaneGeometry, ShaderMaterial>;
    private bufferTextureA?: WebGLRenderTarget;
    private bufferTextureB?: WebGLRenderTarget;

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



    constructor(width: number, height: number, element: Element) {

        this.width = width;
        this.height = height;

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.autoClear = false;
        this.renderer.setSize(width, height, false);

        element.appendChild(this.renderer.domElement);

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

        // Apply the transformation of the material
        this.material!.uniforms!.tex = {value: this.bufferTextureA!.texture!};
        this.material!.uniforms!.from = {value: new Vector2(Math.abs(this.pos.x % this.width), Math.abs(this.pos.y % this.height))};
        this.material!.uniforms!.to = {value: new Vector2(Math.abs(this.previousPos.x % this.width), Math.abs(this.previousPos.y % this.height))};
        this.material!.uniforms!.color = {value: new Vector3(this.color.r / 255, this.color.g / 255, this.color.b / 255)};
        this.material!.uniforms!.dryRate = {value: this.dryRate};
        this.material!.uniforms!.paintDrop = {value: this.paintDrop};

        this.renderer.setRenderTarget(this.bufferTextureB!);
        this.renderer.render(this.bufferScene!, this.camera!);

        // Apply the texture to the screen
        this.copy_material!.uniforms!.tex = {value: this.bufferTextureB!.texture!};
        this.renderer.setRenderTarget(null);
        this.renderer.render(this.scene!, this.camera!);

        const tA = this.bufferTextureA;
        this.bufferTextureA = this.bufferTextureB;
        this.bufferTextureB = tA;
    }

    async load(): Promise<void> {

        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(-this.width / 2, this.width / 2, -this.height / 2, this.height / 2, 1, 1000);
        this.camera.position.set(0, 0, -100);
        this.camera.rotateX(Math.PI);

        // We need the extra precision to calculate the drying time
        this.bufferScene = new THREE.Scene();
        this.bufferTextureA = new THREE.WebGLRenderTarget(this.width, this.height, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.NearestFilter,
            type: THREE.FloatType,
        });
        this.bufferTextureB = new THREE.WebGLRenderTarget(this.width, this.height, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.NearestFilter,
            type: THREE.FloatType,
        });

        const plane = new THREE.PlaneGeometry(this.width, this.height, 1, 1);

        const fileLoader = new THREE.FileLoader();

        const vertexShader = await fileLoader.loadAsync(vertexShaderFile) as string;
        const fragmentShader = await fileLoader.loadAsync(firstInkShaderFile) as string;
        const copyShader = await fileLoader.loadAsync(effectShaderFile) as string;

        this.material = new THREE.ShaderMaterial({
            uniforms: {
                iResolution: {value: new Vector2(this.width, this.height)},
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            depthTest: false,
        });

        this.copy_material = new THREE.ShaderMaterial({
            vertexShader: vertexShader,
            fragmentShader: copyShader,
            depthTest: false,
        });

        // buffer scene
        const bufferObject = new THREE.Mesh(plane, this.material);
        this.bufferScene.add(bufferObject);

        // screen scene
        this.mesh = new THREE.Mesh(plane, this.copy_material);
        this.scene.add(this.mesh);
    }
}
