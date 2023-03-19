import {numberInput, visualizer} from "../VisualizerDirectory";
import {IVisualizer} from "../IVisualizer";
import * as THREE from "three";

// Is this going to be sufficient?
import fragmentShaderFile from './shaders/fragment.frag';
import vertexShaderFile from './shaders/vertex.vert';
import panda from './images/panda.jpg';
import {
    Mesh, MeshBasicMaterial,
    MeshNormalMaterial,
    NearestFilter,
    PlaneGeometry,
    ShaderMaterial,
    Vector2,
    WebGLRenderTarget
} from "three";

@visualizer("Apparitions", "2d")
export class Apparitions implements IVisualizer {
    @numberInput("Blue", 0, 10)
    blue: number = 1;

    private scene?: THREE.Scene;
    private camera?: THREE.OrthographicCamera;
    private readonly renderer: THREE.WebGLRenderer;

    private frameId: number | null = null;
    private material?: ShaderMaterial;
    private width: number;
    private height: number;
    private mesh?: Mesh<PlaneGeometry, MeshBasicMaterial>;
    private bufferScene?: THREE.Scene;
    private bufferTextureA?: WebGLRenderTarget;
    private bufferTextureB?: WebGLRenderTarget;

    constructor(width: number, height: number, element: Element) {
        this.width = width;
        this.height = height;

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(width, height, false);

        element.appendChild(this.renderer.domElement);
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

    private render(): void {
        // renders A->B then swaps
        this.material!.uniforms.opacity.value = this.blue;

        this.material!.uniforms!.tex = {value: this.bufferTextureA!.texture!};
        this.renderer.setRenderTarget(this.bufferTextureB!);
        this.renderer.render(this.bufferScene!, this.camera!);


        this.mesh!.material!.map = this.bufferTextureB!.texture;
        this.renderer.setRenderTarget(null);
        this.renderer.render(this.scene!, this.camera!);

        const tA = this.bufferTextureA;
        this.bufferTextureA = this.bufferTextureB;
        this.bufferTextureB = tA;
        this.material!.uniforms.iTime.value = 2.0;

    }

    async load(): Promise<void> {

        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(-this.width / 2, this.width / 2, -this.height/2 , this.height/2 , 1, 1000);
        this.camera.position.set(0, 0, -100);
        //this.camera.lookAt(0, 0, 0)
        this.camera.rotateX(Math.PI);


        this.bufferScene = new THREE.Scene();
        this.bufferTextureA = new THREE.WebGLRenderTarget(this.width, this.height, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.NearestFilter
        });
        this.bufferTextureB = new THREE.WebGLRenderTarget(this.width, this.height, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.NearestFilter
        });
        const plane = new THREE.PlaneGeometry(this.width, this.height, 1, 1);

        const fileLoader = new THREE.FileLoader();

        const vertexShader = await fileLoader.loadAsync(vertexShaderFile) as string;
        const fragmentShader = await fileLoader.loadAsync(fragmentShaderFile) as string;


        this.material = new THREE.ShaderMaterial({
            uniforms: {
                tex: {value: this.bufferTextureA.texture},
                opacity: {value: 0.5},
                iResolution: {value: new Vector2(this.width, this.height)},
                iTime: {value: 0},
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader
        });

        const bufferObject = new THREE.Mesh(plane, this.material);
        this.bufferScene.add(bufferObject);


        // Create a mesh with the material and geometry
        const finalMaterial = new THREE.MeshBasicMaterial({map: this.bufferTextureB.texture});
        this.mesh = new THREE.Mesh(plane, finalMaterial);
        this.scene.add(this.mesh);
    }
}
