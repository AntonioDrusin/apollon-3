import {booleanInput, colorInput, imageInput, numberInput, visualizer} from "../VisualizerDirectory";
import {IVisualizer, IVisualizerColor} from "../IVisualizer";
import * as THREE from "three";
import inkShaderFile from './shaders/ink_shader.frag';
import inkDataShaderFile from './shaders/ink_data_shader.frag';
import vertexShaderFile from './shaders/vertex.vert';
import effectShaderFile from './shaders/effect_shader.frag';
import mixShaderFile from './shaders/mix_shader.frag';
import mixDataShaderFile from './shaders/mix_data_shader.frag';
import {
    ShaderMaterial,
    Vector2,
    Vector3,
    WebGLRenderTarget
} from "three";
import {noise2D} from "./Noise";


// This is a port to shaders of
// https://editor.p5js.org/StevesMakerspace/sketches/d0lPUJt8T


@visualizer("Apparitions", "2d")
export class Apparitions implements IVisualizer {
    // Parameters
    @numberInput("Move noise", 0.001, 0.16)
    private noiseCoordOffset = 0.08;
    @numberInput("Move amplification", 1, 24)
    private pixelSkip = 12;
    @numberInput("Dry rate", -0.0001, 0.0060) // -0.0028, 0.0048
    private dryRate = 0.0012
    @numberInput("Paint amount", 0, 220) // 0, 200
    private paintDrop = 40
    @numberInput("Background Alpha", 0, 1)
    private backgroundAlpha = 0.5;
    @numberInput("Ink Alpha", 0, 1)
    private inkAlpha = 0.5;
    @numberInput("Mix Ratio", 0.01, 0.99) // 0, 1
    private mixRatio = 0.5;
    @booleanInput("Pen Down")
    private penDown: boolean = true;
    @booleanInput("Hold Pen Color")
    private holdPenColor: boolean = true;
    @colorInput("Pen Color")
    private inputPenColor: IVisualizerColor = {red: 0, green: 0, blue: 0};
    @colorInput("Background Color")
    private backgroundColor: IVisualizerColor = {red: 0, green: 0, blue: 0};
    @imageInput("Image")
    private imageUrl?: string;

    private penColor?: IVisualizerColor;

    private readonly renderer: THREE.WebGLRenderer;
    private readonly inkScene: THREE.Scene;
    private readonly inkDataScene: THREE.Scene;
    private readonly mixScene: THREE.Scene;
    private readonly mixDataScene: THREE.Scene;
    private readonly scene: THREE.Scene;

    private readonly camera: THREE.OrthographicCamera;

    private inkMaterial?: ShaderMaterial;
    private inkDataMaterial?: ShaderMaterial;
    private mixMaterial?: ShaderMaterial;
    private mixDataMaterial?: ShaderMaterial;
    private effectMaterial?: ShaderMaterial;
    private readonly width: number;
    private readonly height: number;
    private readonly firstTexture: WebGLRenderTarget;
    private readonly paintTexture: WebGLRenderTarget;
    private readonly firstDataTexture: WebGLRenderTarget;
    private readonly paintDataTexture: WebGLRenderTarget;
    private backgroundTexture?: THREE.Texture;

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
            minFilter: THREE.LinearFilter,
            magFilter: THREE.NearestFilter,
            type: THREE.FloatType,
        };
        const dataTextureParams = {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.NearestFilter,
            type: THREE.FloatType,
            format: THREE.RGFormat,
        }

        this.firstTexture = new THREE.WebGLRenderTarget(this.width, this.height, imageTextureParams);
        this.paintTexture = new THREE.WebGLRenderTarget(this.width, this.height, imageTextureParams);
        this.paintDataTexture = new THREE.WebGLRenderTarget(this.width, this.height, dataTextureParams);
        this.firstDataTexture = new THREE.WebGLRenderTarget(this.width, this.height, dataTextureParams);

        this.inkScene = new THREE.Scene();
        this.inkDataScene = new THREE.Scene();
        this.mixScene = new THREE.Scene();
        this.mixDataScene = new THREE.Scene();
        this.scene = new THREE.Scene();

        this.camera = new THREE.OrthographicCamera(-this.width / 2, this.width / 2, -this.height / 2, this.height / 2, 1, 1000);
        this.camera.position.set(0, 0, -100);
        this.camera.rotateX(Math.PI);

        this.previousPos.x = this.pos.x = Math.random() * width;
        this.previousPos.y = this.pos.y = Math.random() * width;

        // The color will be an input
        // this.renderer.setRenderTarget(this.paintTexture);
        // this.renderer.setClearColor(0xdad0bc, 1);
        // this.renderer.clear();
        // this.renderer.render(this.scene, this.camera);

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

        this.noiseOffsets.x += this.noiseCoordOffset;
        this.noiseOffsets.y += this.noiseCoordOffset;

        this.pos.x += ((noise2D(this.noiseOffsets.x, 0) * this.pixelSkip));
        this.pos.y += ((noise2D(this.noiseOffsets.y, 0) * this.pixelSkip));
    }

    private render(): void {
        this.addPaint();

        // Apply the transformation of the inkMaterial
        this.inkMaterial!.uniforms!.iResolution = {value: new Vector2(this.width, this.height)};
        this.inkMaterial!.uniforms!.imageTexture = {value: this.paintTexture.texture};
        this.inkMaterial!.uniforms!.dataTexture = {value: this.paintDataTexture.texture};
        this.inkMaterial!.uniforms!.dryRate = {value: this.dryRate};
        this.inkMaterial!.uniforms!.mixRatio = {value: this.mixRatio};
        this.renderer.setRenderTarget(this.firstTexture);
        this.renderer.render(this.inkScene!, this.camera);

        // Apply the transformation to the data texture as well
        this.inkDataMaterial!.uniforms!.iResolution = {value: new Vector2(this.width, this.height)};
        this.inkDataMaterial!.uniforms!.imageTexture = {value: this.paintTexture.texture};
        this.inkDataMaterial!.uniforms!.dataTexture = {value: this.paintDataTexture.texture};
        this.inkDataMaterial!.uniforms!.dryRate = {value: this.dryRate};
        this.inkDataMaterial!.uniforms!.mixRatio = {value: this.mixRatio};
        this.renderer.setRenderTarget(this.firstDataTexture);
        this.renderer.render(this.inkDataScene!, this.camera);


        // Mix the two ink textures
        this.mixMaterial!.uniforms!.imageTexture = {value: this.firstTexture.texture};
        this.mixMaterial!.uniforms!.dataTexture = {value: this.firstDataTexture.texture};
        this.mixMaterial!.uniforms!.from = {value: new Vector2(Math.abs(this.pos.x % this.width), Math.abs(this.pos.y % this.height))};
        this.mixMaterial!.uniforms!.to = {value: new Vector2(Math.abs(this.previousPos.x % this.width), Math.abs(this.previousPos.y % this.height))};
        if (!this.penDown || !this.holdPenColor || !this.penColor) {
            this.penColor = {...this.inputPenColor};
        }
        this.mixMaterial!.uniforms!.color = {value: new Vector3(this.penColor.red, this.penColor.green, this.penColor.blue)};
        this.mixMaterial!.uniforms!.paintDrop = {value: this.paintDrop};
        this.mixMaterial!.uniforms!.resolution = {value: new Vector2(this.width, this.height)};
        this.mixMaterial!.uniforms!.penDown = {value: this.penDown ? 1 : -1};
        this.renderer.setRenderTarget(this.paintTexture);
        this.renderer.render(this.mixScene, this.camera);

        // Mix the two ink texture to the data texture as well
        this.mixDataMaterial!.uniforms!.imageTexture = {value: this.firstTexture.texture};
        this.mixDataMaterial!.uniforms!.dataTexture = {value: this.firstDataTexture.texture};
        this.mixDataMaterial!.uniforms!.from = {value: new Vector2(Math.abs(this.pos.x % this.width), Math.abs(this.pos.y % this.height))};
        this.mixDataMaterial!.uniforms!.to = {value: new Vector2(Math.abs(this.previousPos.x % this.width), Math.abs(this.previousPos.y % this.height))};
        if (!this.penDown || !this.holdPenColor || !this.penColor) {
            this.penColor = {...this.inputPenColor};
        }
        this.mixDataMaterial!.uniforms!.color = {value: new Vector3(this.penColor.red, this.penColor.green, this.penColor.blue)};
        this.mixDataMaterial!.uniforms!.paintDrop = {value: this.paintDrop};
        this.mixDataMaterial!.uniforms!.resolution = {value: new Vector2(this.width, this.height)};
        this.mixDataMaterial!.uniforms!.penDown = {value: this.penDown ? 1 : -1};
        this.renderer.setRenderTarget(this.paintDataTexture);
        this.renderer.render(this.mixDataScene, this.camera);


        // Apply the texture to the screen
        this.effectMaterial!.uniforms!.paintTexture = {value: this.paintTexture.texture};
        this.effectMaterial!.uniforms!.dataTexture = {value: this.paintDataTexture.texture};
        this.effectMaterial!.uniforms!.backgroundTexture = {value: this.backgroundTexture};
        this.effectMaterial!.uniforms!.backgroundColorAlpha = {value: this.backgroundTexture ? this.backgroundAlpha : 1};
        this.effectMaterial!.uniforms!.inkAlpha = {value: this.inkAlpha};
        this.effectMaterial!.uniforms!.backgroundColor = {value: new Vector3(this.backgroundColor.red, this.backgroundColor.green, this.backgroundColor.blue)};

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

        this.inkMaterial = await this.getMaterial(inkShaderFile, vertexShader);
        this.inkDataMaterial = await this.getMaterial(inkDataShaderFile, vertexShader);
        this.mixMaterial = await this.getMaterial(mixShaderFile, vertexShader);
        this.mixDataMaterial = await this.getMaterial(mixDataShaderFile, vertexShader);
        this.effectMaterial = await this.getMaterial(effectShaderFile, vertexShader);

        this.inkScene.add(new THREE.Mesh(plane, this.inkMaterial));
        this.inkDataScene.add(new THREE.Mesh(plane, this.inkDataMaterial));
        this.mixScene.add(new THREE.Mesh(plane, this.mixMaterial));
        this.mixDataScene.add(new THREE.Mesh(plane, this.mixDataMaterial));
        this.scene.add(new THREE.Mesh(plane, this.effectMaterial));

        if (this.imageUrl) {
            this.backgroundTexture = await this.loadTexture(this.imageUrl);
        }
    }

    private loadTexture(textureUrl: string): Promise<THREE.Texture> {
        return new Promise((resolve, reject) => {
            if (this.imageUrl) {
                this.textureLoader.load(textureUrl,
                    (texture) => {
                        resolve(texture);
                    },
                    event => {
                    },
                    (error) => {
                        reject(error)
                    }
                );
            }
        });
    }

}
