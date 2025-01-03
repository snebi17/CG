import { UpdateSystem } from "./engine/systems/UpdateSystem.js";
import { UnlitRenderer } from "./engine/renderers/UnlitRenderer.js";
import { ResizeSystem } from "./engine/systems/ResizeSystem.js";
import { GLTFLoader } from "./engine/loaders/GLTFLoader.js";
import * as SceneUtils from "./engine/core/SceneUtils.js";
import { Transform } from "./engine/core.js";

import { Camera } from "engine/core.js";
import { FirstPersonController } from "../engine/controllers/FirstPersonController.js";
// import { OrbitController } from "./engine/controllers/OrbitController.js";
import { TurntableController } from "./engine/controllers/TurntableController.js";
// import { TouchController } from "./engine/controllers/TouchController.js";

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

const camera = scene.find((node) => node.getComponentOfType(Camera));

if (!camera) {
	throw new Error("A camera in the scene is require to run this example");
}

camera.addComponent(new FirstPersonController(camera, canvas));

function resize({ displaySize: { width, height } }) {
	camera.getComponentOfType(Camera).aspect = width / height;
}

const game = new Game(scene, camera, renderer);

console.log(SceneUtils.getGlobalModelMatrix(game.balls.at(0).node));


new ResizeSystem({ canvas, resize }).start();
new UpdateSystem(game).start();
