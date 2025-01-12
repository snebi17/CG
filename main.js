import { UpdateSystem } from "./engine/systems/UpdateSystem.js";
import { Renderer } from "../engine/renderers/Renderer.js";
import { ResizeSystem } from "./engine/systems/ResizeSystem.js";
import { GLTFLoader } from "../engine/loaders/GLTFLoader.js";
import { Camera, Light, Node, Transform } from "../engine/core.js";

import { Game } from "./logic/Game.js";

const canvas = document.querySelector("canvas");
const renderer = new Renderer(canvas);
await renderer.initialize();

const loader = new GLTFLoader();
await loader.load(
	new URL("../models/table/table2.gltf", import.meta.url)
);

const scene = loader.loadScene(loader.defaultScene);
if (!scene) {
	throw new Error("A default scene is required to run this example");
}

const firstLight = new Node();
firstLight.addComponent(new Transform({ translation: [0, 3.5, 0] }));
firstLight.addComponent(new Light({ intensity: 2 }));

scene.addChild(firstLight);

// const secondLight = new Node();
// secondLight.addComponent(new Transform({ translation: [0, 3.5, 0] }));
// secondLight.addComponent(new Light({ intensity: 2 }));

// scene.addChild(secondLight);

const camera = scene.find((node) => node.getComponentOfType(Camera));
camera.isDynamic = true;

if (!camera) {
	throw new Error("A camera in the scene is require to run this example");
}

function resize({ displaySize: { width, height } }) {
	camera.getComponentOfType(Camera).aspect = width / height;
}

const game = new Game(scene, camera, renderer, canvas);

new ResizeSystem({ canvas, resize }).start();
new UpdateSystem(game).start();
