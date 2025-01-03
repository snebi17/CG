import { UpdateSystem } from "./engine/systems/UpdateSystem.js";
import { UnlitRenderer } from "../engine/renderers/UnlitRenderer.js";
import { ResizeSystem } from "./engine/systems/ResizeSystem.js";
import { GLTFLoader } from "../engine/loaders/GLTFLoader.js";

import { Camera } from "engine/core.js";
import { FirstPersonController } from "../engine/controllers/FirstPersonController.js";
// import { OrbitController } from "./engine/controllers/OrbitController.js";
import { TurntableController } from "./engine/controllers/TurntableController.js";
import {
	calculateAxisAlignedBoundingBox,
	mergeAxisAlignedBoundingBoxes,
} from "../../engine/core/MeshUtils.js";
// import { TouchController } from "./engine/controllers/TouchController.js";
import { Model } from "./engine/core.js";

import { Game } from "./logic/Game.js";

const canvas = document.querySelector("canvas");
const renderer = new UnlitRenderer(canvas);
await renderer.initialize();

const loader = new GLTFLoader();
await loader.load(new URL("../models/table/table.gltf", import.meta.url));

const scene = loader.loadScene(loader.defaultScene);
if (!scene) {
	throw new Error("A default scene is required to run this example");
}

// const camera = scene.find((node) => {

// 	const camera = node.getComponentOfType(Camera);
// 	const model = camera.getComponentOfType(Model);

// 	if (model) {
// 		const boxes = model.primitives.map((primitive) =>
// 			calculateAxisAlignedBoundingBox(primitive.mesh)
// 		);

// 		camera.aabb = mergeAxisAlignedBoundingBoxes(boxes);
// 	}
// 	return camera;
// });

const camera = scene.find((node) => node.getComponentOfType(Camera));
camera.isDynamic = true;

loader.loadNode("Side").isStatic = true;
loader.loadNode("Side.001").isStatic = true;
loader.loadNode("Side.002").isStatic = true;
loader.loadNode("Side.003").isStatic = true;

if (!camera) {
	throw new Error("A camera in the scene is require to run this example");
}

camera.addComponent(new FirstPersonController(camera, canvas));

function resize({ displaySize: { width, height } }) {
	camera.getComponentOfType(Camera).aspect = width / height;
}

const game = new Game(scene, camera, renderer);

new ResizeSystem({ canvas, resize }).start();
new UpdateSystem(game).start();
