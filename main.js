import { ResizeSystem } from "engine/systems/ResizeSystem.js";
import { UpdateSystem } from "engine/systems/UpdateSystem.js";
import { FirstPersonController } from "engine/controllers/FirstPersonController.js";

import { GLTFLoader } from "engine/loaders/GLTFLoader.js";
import { UnlitRenderer } from "engine/renderers/UnlitRenderer.js";

import { Camera } from "engine/core.js";

const canvas = document.querySelector("canvas");
const renderer = new UnlitRenderer(canvas);
await renderer.initialize();

const loader = new GLTFLoader();
await loader.load(
	new URL("../../../models/pool-table/pool-table.gltf", import.meta.url)
);

const stick = loader.loadNode("Stick");
loader.loadNode("Side").isStatic = true;
loader.loadNode("Side.001").isStatic = true;
loader.loadNode("Side.002").isStatic = true;
loader.loadNode("Side.003").isStatic = true;

const scene = loader.loadScene(loader.defaultScene);
if (!scene) {
	throw new Error("A default scene is required to run this example");
}

const camera = scene.find((node) => node.getComponentOfType(Camera));
if (!camera) {
	throw new Error("A camera in the scene is require to run this example");
}

camera.addComponent(new FirstPersonController(camera, canvas));

function update(time, dt) {
	scene.traverse((node) => {
		for (const component of node.components) {
			component.update?.(time, dt);
		}
	});
}

function render() {
	renderer.render(scene, camera);
}

function resize({ displaySize: { width, height } }) {
	camera.getComponentOfType(Camera).aspect = width / height;
}

new ResizeSystem({ canvas, resize }).start();
new UpdateSystem({ update, render }).start();
