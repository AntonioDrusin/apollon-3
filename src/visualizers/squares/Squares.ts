import {numberInput, visualizer} from "../VisualizerDirectory";
import {IVisualizer} from "../IVisualizer";
import * as THREE from "three";


@visualizer("Squares", "2d")
export class Squares implements IVisualizer {

    @numberInput("Diameter", 0.1, 2.0)
    inputDiameter: number = 1.0;
    @numberInput("Light Intensity", 0.1, 3.0)
    lightIntensity: number = 0.5;

    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private frameId: number | null;
    private dodecahedron1: THREE.Mesh;
    private diameter: number;
    private light: THREE.PointLight;
    private lightMesh: THREE.Mesh;

    constructor(width: number, height: number, element: Element) {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer();

        this.renderer.setSize(width, height);
        const child = this.renderer.domElement;
        element.appendChild(child);

        this.frameId = null;
        this.diameter = this.inputDiameter;

        const geometry = new THREE.DodecahedronGeometry(1);
        const material = new THREE.MeshPhongMaterial( { color: 0x00ff00 } );


        this.dodecahedron1 = new THREE.Mesh(geometry, material);

        this.scene.add(this.dodecahedron1);

        this.camera.position.z = 5;

        const sphere = new THREE.SphereGeometry( 0.1, 16, 8 );
        this.light = new THREE.PointLight(0xffffff, 2, 50);
        this.lightMesh = new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0x404040 } ) );
        this.light.add(this.lightMesh);
        this.light.position.set(-1, -2, 0);
        this.scene.add(this.light);

        const ambientLight = new THREE.AmbientLight( 0x303030 );
        this.scene.add( ambientLight );

       this.start();
    }

    async load(): Promise<void> {
    }

    private render(): void {
        this.dodecahedron1.scale.x = this.inputDiameter;
        this.dodecahedron1.scale.y = this.inputDiameter;
        this.dodecahedron1.scale.z = this.inputDiameter;

        this.light.intensity = this.lightIntensity;
        this.lightMesh.scale.x = this.lightIntensity;
        this.lightMesh.scale.y = this.lightIntensity;
        this.lightMesh.scale.z = this.lightIntensity;

        this.dodecahedron1.rotation.x += 0.01;
        this.dodecahedron1.rotation.y += 0.01;

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
}
