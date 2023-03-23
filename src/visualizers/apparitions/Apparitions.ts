import {numberInput, visualizer} from "../VisualizerDirectory";
import {IVisualizer} from "../IVisualizer";
import * as THREE from "three";
import fragmentShaderFile from './shaders/fragment.frag';
import vertexShaderFile from './shaders/vertex.vert';
import copyShaderFile from './shaders/copy_shader.frag';
import lineShaderFile from './shaders/line_shader.frag';
import {
    Mesh,
    PlaneGeometry,
    ShaderMaterial,
    Vector2, Vector4,
    WebGLRenderTarget
} from "three";
import {noise2D} from "./Noise";

function distance(x0: number, y0: number, x1: number, y1: number): number {
    return Math.sqrt(((x0 - x1) ** 2) + ((y0 - y1) ** 2));
}

function map(n: number, fromLow: number, fromHigh: number, toLow: number, toHigh: number): number {
    return ((n - fromLow) / (fromHigh - fromLow) * (toHigh - toLow)) + toLow;
}

function lerp(from: number, to: number, by: number): number {
    return from * (1 - by) + to * by;
}

function wrap(value: number, from: number, to: number): number {
    return from + Math.abs((value - from) % (to-from));
}

@visualizer("Apparitions", "2d")
export class Apparitions implements IVisualizer {
    @numberInput("X coord", -0.5, 0.5)
    posX: number = 0;

    @numberInput("Y coord", -0.5, 0.5)
    posY: number = 0;

    private readonly renderer: THREE.WebGLRenderer;
    private scene?: THREE.Scene;
    private bufferScene?: THREE.Scene;
    private lineScene?: THREE.Scene;
    private camera?: THREE.OrthographicCamera;

    private frameId: number | null = null;
    private material?: ShaderMaterial;
    private copy_material?: ShaderMaterial;
    private line_material?: ShaderMaterial;
    private readonly width: number;
    private readonly height: number;
    private mesh?: Mesh<PlaneGeometry, ShaderMaterial>;
    private lineMesh?: Mesh<PlaneGeometry, ShaderMaterial>;
    private bufferTextureA?: WebGLRenderTarget;
    private bufferTextureB?: WebGLRenderTarget;
    private penSize = 10;

    // Simulation parameters
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

    private posOffset = 0.08;
    private colorOffset = 0.5;
    private pixelSkip = 12;
    private colorSkip = 7;


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

        this.noiseOffsets.r += this.colorOffset;
        this.noiseOffsets.g += this.colorOffset;
        this.noiseOffsets.b += this.colorOffset;
        this.noiseOffsets.x += this.posOffset;
        this.noiseOffsets.y += this.posOffset;

        //this.pos.x += Math.round((noise2D(this.noiseOffsets.x, 0)) * this.pixelSkip);
        //this.pos.y += Math.round((noise2D(this.noiseOffsets.y, 0)) * this.pixelSkip);

        this.pos.x = this.posX * this.width;
        this.pos.y = this.posY * this.height;

        this.color.r += Math.round((noise2D(this.noiseOffsets.r, 0)) * this.colorSkip);
        this.color.g += Math.round((noise2D(this.noiseOffsets.g, 0)) * this.colorSkip);
        this.color.b += Math.round((noise2D(this.noiseOffsets.b, 0)) * this.colorSkip);
        this.color.r %= 255;
        this.color.g %= 255;
        this.color.b %= 255;

        this.drawLinePoints();

        this.previousPos.x = this.pos.x;
        this.previousPos.y = this.pos.y;
    }

    private drawLinePoints() {
        // render the line scene to texture A to add points
         const dist = distance(this.pos.x, this.pos.y, this.previousPos.x, this.previousPos.y)/(this.penSize/2);

         for (let n=0; n<1; n+=1/dist) {
             let x = lerp(this.pos.x, this.previousPos.x, n);
             let y = lerp(this.pos.y, this.previousPos.y, n);
             x = wrap(x, -this.width / 2, this.width / 2);
             y = wrap(y, -this.height / 2, this.height / 2);
             console.log("X: " + x +" ," + y);
             this.drawPoint(x,y);
         }
    }

    private drawPoint(x: number, y: number) {
        // render the line scene to texture A to add points
        this.lineMesh!.position.set(x, y, 0);
        this.lineMesh!.material.uniforms!.color = {value: new Vector4(this.color.r/255, this.color.g/255, this.color.b/255, 1.0)}; // I guess the ink amount is 1.0
        this.renderer.setRenderTarget(this.bufferTextureA!);
        this.renderer.render(this.lineScene!, this.camera!);
    }


    private render(): void {
        this.addPaint();

        // Apply the transformation of the material
        this.material!.uniforms!.tex = {value: this.bufferTextureA!.texture!};
        this.renderer.setRenderTarget(this.bufferTextureB!);
        this.renderer.render(this.bufferScene!, this.camera!);

        // Apply the texture to the screen
        this.copy_material!.uniforms!.tex = {value: this.bufferTextureB!.texture!};
        this.renderer.setRenderTarget(null);
        this.renderer.render(this.scene!, this.camera!);

        const tA = this.bufferTextureA;
        this.bufferTextureA = this.bufferTextureB;
        this.bufferTextureB = tA;
        this.material!.uniforms.iTime.value = 2.0;

    }

// https://editor.p5js.org/StevesMakerspace/sketches/d0lPUJt8T
// https://editor.p5js.org/StevesMakerspace/sketches/d0lPUJt8T

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
        const fragmentShader = await fileLoader.loadAsync(fragmentShaderFile) as string;
        const copyShader = await fileLoader.loadAsync(copyShaderFile) as string;
        const lineShader = await fileLoader.loadAsync(lineShaderFile) as string;

        this.material = new THREE.ShaderMaterial({
            uniforms: {
                tex: {value: this.bufferTextureA.texture},
                opacity: {value: 0.5},
                iResolution: {value: new Vector2(this.width, this.height)},
                iTime: {value: 0},
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            depthTest: false,
        });

        this.copy_material = new THREE.ShaderMaterial({
            uniforms: {
                tex: {value: this.bufferTextureA.texture},
            },
            vertexShader: vertexShader,
            fragmentShader: copyShader,
            depthTest: false,
        });

        this.line_material = new THREE.ShaderMaterial({
            uniforms: {
                color: {value: new Vector4(0.5, 1, 1, 0.5)}
            },
            vertexShader: vertexShader,
            fragmentShader: lineShader,
            depthTest: false,
        })

        // buffer scene
        const bufferObject = new THREE.Mesh(plane, this.material);
        this.bufferScene.add(bufferObject);

        // line scene
        this.lineScene = new THREE.Scene();
        const lineBox = new THREE.PlaneGeometry(this.penSize, this.penSize, 1, 1); // size of the paintbrush
        this.lineMesh = new THREE.Mesh(lineBox, this.line_material);
        this.lineMesh.position.set(100, 100, 100);
        this.lineScene.add(this.lineMesh);

        // screen scene
        this.mesh = new THREE.Mesh(plane, this.copy_material);
        this.scene.add(this.mesh);
    }
}
