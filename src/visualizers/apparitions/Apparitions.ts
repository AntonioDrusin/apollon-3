import {numberInput, visualizer} from "../VisualizerDirectory";
import {IVisualizer} from "../IVisualizer";
import * as THREE from "three";

// Is this going to be sufficient?
import fragmentShaderFile from './shaders/fragment.frag';
import vertexShaderFile from './shaders/vertex.vert';
import panda from './images/panda.jpg';
import {ShaderMaterial} from "three";

@visualizer("Apparitions", "2d")
export class Apparitions implements IVisualizer {
    @numberInput("Blue", 0, 1)
    blue: number = 1;

    private readonly scene: THREE.Scene;
    private readonly camera: THREE.PerspectiveCamera;
    private readonly renderer: THREE.WebGLRenderer;

    private frameId: number | null = null;
    private material?: ShaderMaterial;

    constructor(width: number, height: number, element: Element) {
        console.log(width);
        console.log(height);
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 10);
        this.camera.position.set(0,0,4);

        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.setSize(width, height);

        element.appendChild(this.renderer.domElement);
    }

    private render(): void {
        this.material!.uniforms.opacity.value = this.blue;
        this.renderer.render(this.scene, this.camera);
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

    async load(): Promise<void> {
        console.log('loading');
        const geometry = new THREE.PlaneGeometry();
        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load(panda);
        const fileLoader = new THREE.FileLoader();

        const vertexShader = await fileLoader.loadAsync(vertexShaderFile) as string;
        const fragmentShader = await fileLoader.loadAsync(fragmentShaderFile) as string;

        console.log(JSON.stringify(vertexShader));

        // Create a material with the texture and the custom shaders
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                tex: { value: texture },
                opacity: { value: 0.5}
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader
        });

        // Create a mesh with the material and geometry
        const mesh = new THREE.Mesh(geometry, this.material);
         mesh.position.set(0, 0, 0);
        //mesh.rotation.set(0, 0, 0);
        this.scene.add(mesh);
        console.log('loaded');
    }
}
