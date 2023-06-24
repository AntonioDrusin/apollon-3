import {booleanInput, colorInput, numberInput, selectOption, visualizer} from "../VisualizerDirectory";
import {IVisualizer, IVisualizerColor} from "../IVisualizer";
import * as THREE from "three";
import vertexShaderFile from './shaders/vertex.vert';
import shaderCommon from './shaders/common.frag';
import shaderAFile from './shaders/shader_a.frag';
import shaderBFile from './shaders/shader_b.frag';
import shaderCFile from './shaders/shader_c.frag';
import shaderDFile from './shaders/shader_d.frag';
import shaderScreenFile from './shaders/shader_screen.frag';
import {
    ShaderMaterial,
    Vector2,
    Vector3,
    WebGLRenderTarget
} from "three";
import {noise2D} from "../Noise";


// This started from a port to shaders of
// https://www.shadertoy.com/view/Dlt3zs

@visualizer("visualizer.marble.marblePainting", "2d")
export class MarblePainting implements IVisualizer {
    // Dynamic Parameters
    @numberInput("visualizer.marble.moveNoise", 0.001, 0.16)
    private noiseCoordOffset = 0.08;
    @numberInput("visualizer.marble.moveAmplification", 1, 24)
    private pixelSkip = 12;
    @numberInput("visualizer.marble.expanse", 1, 40)
    private expanse: number = 20;
    @numberInput("visualizer.marble.disperse", 0.2, 3)
    private disperse: number = 1;
    @numberInput("visualizer.marble.brushSize", 2, 80)
    private brushSize: number = 40;
    @selectOption("visualizer.marble.penDownPosition", ["visualizer.marble.same", "visualizer.marble.randomized"])
    private pendownPosition: number = 0;
    @booleanInput("visualizer.marble.penDown")
    private penDown: boolean = true;
    @booleanInput("visualizer.marble.holdPenColor")
    private holdPenColor: boolean = true;
    @colorInput("visualizer.marble.penColor")
    private inputPenColor: IVisualizerColor = {red: 0, green: 0, blue: 0};

    // Options
    @selectOption("visualizer.marble.movementMapping", ["visualizer.marble.toroid", "visualizer.marble.bounce"])
    private movementMapping: number = 0;

    private penColor?: IVisualizerColor;

    private readonly renderer: THREE.WebGLRenderer;
    private readonly camera: THREE.OrthographicCamera;

    private readonly sceneA: THREE.Scene;
    private readonly sceneB: THREE.Scene;
    private readonly sceneC: THREE.Scene;
    private readonly sceneD: THREE.Scene;
    private readonly sceneScreen: THREE.Scene;

    private materialA?: ShaderMaterial;
    private materialB?: ShaderMaterial;
    private materialC?: ShaderMaterial;
    private materialD?: ShaderMaterial;
    private materialScreen?: ShaderMaterial;

    private readonly textureA: WebGLRenderTarget;
    private readonly textureB: WebGLRenderTarget;
    private readonly textureC: WebGLRenderTarget;
    private readonly textureD: WebGLRenderTarget;

    private readonly width: number;
    private readonly height: number;
    private frame: number = 0;

    private backgroundTexture?: THREE.Texture;

    private previousPenDown: boolean = false;

    private noiseOffsets = {
        x: Math.random() * 40000,
        y: Math.random() * 40000,
    };

    private pos = {
        x: 0,
        y: 0
    };
    private previousPos = {
        x: 0,
        y: 0,
    }

    private frameId: number | null = null;
    private readonly fileLoader: THREE.FileLoader;
    private readonly textureLoader: THREE.TextureLoader;

    constructor(width: number, height: number, element: Element) {
        this.width = width;
        this.height = height;

        this.fileLoader = new THREE.FileLoader();
        this.textureLoader = new THREE.TextureLoader();
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.autoClear = false;
        this.renderer.setSize(width, height, false);

        element.appendChild(this.renderer.domElement);

        // Create all the textures
        const imageTextureParams = {
            //minFilter: THREE.LinearFilter,
            //magFilter: THREE.NearestFilter,
            type: THREE.UnsignedByteType,
            format: THREE.RGBAFormat,
        };

        this.textureA = new THREE.WebGLRenderTarget(this.width, this.height, imageTextureParams);
        this.textureB = new THREE.WebGLRenderTarget(this.width, this.height, imageTextureParams);
        this.textureC = new THREE.WebGLRenderTarget(this.width, this.height, imageTextureParams);
        this.textureD = new THREE.WebGLRenderTarget(this.width, this.height, imageTextureParams);

        this.sceneA = new THREE.Scene();
        this.sceneB = new THREE.Scene();
        this.sceneC = new THREE.Scene();
        this.sceneD = new THREE.Scene();
        this.sceneScreen = new THREE.Scene();

        this.camera = new THREE.OrthographicCamera(-this.width / 2, this.width / 2, -this.height / 2, this.height / 2, 1, 1000);
        this.camera.position.set(0, 0, -100);
        this.camera.rotateX(Math.PI);

        this.previousPos.x = this.pos.x = Math.random() * width;
        this.previousPos.y = this.pos.y = Math.random() * height;
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

    private movePen(): void {
        this.previousPos.x = this.pos.x;
        this.previousPos.y = this.pos.y;

        this.noiseOffsets.x += this.noiseCoordOffset;
        this.noiseOffsets.y += this.noiseCoordOffset;

        this.pos.x += ((noise2D(this.noiseOffsets.x, 0) * this.pixelSkip));
        this.pos.y += ((noise2D(this.noiseOffsets.y, 0) * this.pixelSkip));

        if (this.pendownPosition === 1 && !this.previousPenDown && this.penDown) {
            this.previousPos.x = this.pos.x = Math.random() * this.width;
            this.previousPos.y = this.pos.y = Math.random() * this.height;
        }
        this.previousPenDown = this.penDown;

        if (!this.penDown || !this.holdPenColor || !this.penColor) {
            this.penColor = {...this.inputPenColor};
        }
    }


    private mapCoordinate(coordinate: number, p: number): number {
        switch (this.movementMapping) {
            case 1: // Triangle
                return 2 * p * Math.abs(coordinate / (2 * p) - Math.floor(coordinate / (2 * p) + 0.5));
            case 0: // Sawtooth
            default:
                return (coordinate / p - Math.floor(0.5 + coordinate / p)) * p + p / 2;
        }
    }

    private setUniforms(material: THREE.ShaderMaterial, currentTexture: string) {
        const to = new Vector2(
            this.mapCoordinate(this.pos.x, this.width),
            this.mapCoordinate(this.pos.y, this.height),
        );

        material.uniforms!.iResolution = {value: new Vector2(this.width, this.height)};
        material.uniforms!.iPaintColor = {value: new Vector3(this.penColor!.red, this.penColor!.green, this.penColor!.blue)};
        material.uniforms!.iPen = {value: to};
        material.uniforms!.iPenDown = {value: this.penDown ? 1.0 : 0.0};
        material.uniforms!.iDisperse = {value: this.disperse };
        material.uniforms!.iExpanse = {value: this.expanse };
        material.uniforms!.iBrushSize = {value: this.brushSize };
        material.uniforms!.iFrame = {value: this.frame };
        if ( currentTexture !== "A") material.uniforms!.iTextureA = {value: this.textureA.texture };
        if ( currentTexture !== "B") material.uniforms!.iTextureB = {value: this.textureB.texture };
        if ( currentTexture !== "C") material.uniforms!.iTextureC = {value: this.textureC.texture };
        if ( currentTexture !== "D") material.uniforms!.iTextureD = {value: this.textureD.texture };
    }

    private render(): void {
        this.movePen();

        // Step A
        this.setUniforms(this.materialA!, "A");
        this.renderer.setRenderTarget(this.textureA);
        this.renderer.render(this.sceneA, this.camera);

        this.setUniforms(this.materialB!, "B");
        this.renderer.setRenderTarget(this.textureB);
        this.renderer.render(this.sceneB, this.camera);

        this.setUniforms(this.materialC!, "C");
        this.renderer.setRenderTarget(this.textureC);
        this.renderer.render(this.sceneC, this.camera);

        this.setUniforms(this.materialD!, "D");
        this.renderer.setRenderTarget(this.textureD);
        this.renderer.render(this.sceneD, this.camera);

        // Apply the effect to the screen
        this.setUniforms(this.materialScreen!, "S");
        this.renderer.setRenderTarget(null);
        this.renderer.render(this.sceneScreen, this.camera);

        this.frame++;
    }

    private async getMaterial(shaderFileName: string, vertexShader: string, common: string): Promise<THREE.ShaderMaterial> {
        const fragmentShader = await this.fileLoader.loadAsync(shaderFileName) as string;

        return new THREE.ShaderMaterial({
            vertexShader: vertexShader,
            fragmentShader: common + "\n" + fragmentShader,
            depthTest: false,
        });
    }

    async load(): Promise<void> {
        const plane = new THREE.PlaneGeometry(this.width, this.height, 1, 1);
        const vertexShader = await this.fileLoader.loadAsync(vertexShaderFile) as string;
        const common = await this.fileLoader.loadAsync(shaderCommon) as string;

        this.materialA = await this.getMaterial(shaderAFile, vertexShader, common);
        this.materialB = await this.getMaterial(shaderBFile, vertexShader, common);
        this.materialC = await this.getMaterial(shaderCFile, vertexShader, common);
        this.materialD = await this.getMaterial(shaderDFile, vertexShader, common);
        this.materialScreen = await this.getMaterial(shaderScreenFile, vertexShader, common);

        this.sceneA.add(new THREE.Mesh(plane, this.materialA));
        this.sceneB.add(new THREE.Mesh(plane, this.materialB));
        this.sceneC.add(new THREE.Mesh(plane, this.materialC));
        this.sceneD.add(new THREE.Mesh(plane, this.materialD));
        this.sceneScreen.add(new THREE.Mesh(plane, this.materialScreen));

    }
}
