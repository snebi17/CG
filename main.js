import { ResizeSystem } from "engine/systems/ResizeSystem.js";
import { UpdateSystem } from "engine/systems/UpdateSystem.js";
import { FirstPersonController } from "engine/controllers/FirstPersonController.js";

import { GLTFLoader } from "engine/loaders/GLTFLoader.js";
import { UnlitRenderer } from "engine/renderers/UnlitRenderer.js";

import { Camera } from "engine/core.js";
import { Transform } from "./engine/core.js";
import { Cue } from "logic/Cue.js";

// import { RotateAnimator } from "./engine/animators/RotateAnimator.js";
// import { Transform } from "./engine/core.js";
import { quat } from "glm";

const canvas = document.querySelector("canvas");
const renderer = new UnlitRenderer(canvas);
await renderer.initialize();

const loader = new GLTFLoader();
await loader.load(new URL("../../../models/table/table.gltf", import.meta.url));

const balls = loader.loadNodes("Ball");
const cue = loader.loadNode("Stick");

const whiteBall = balls.find((ball) => ball.name == "Ball.White");

// const startingRotation = cue.getComponentOfType(Transform).rotation;
// const startingTranslation = cue.getComponentOfType(Transform).translation;

// startingRotation[1] = -0.6;
// startingRotation[0] = 0.2;
// startingRotation[2] = 0.1;
// startingTranslation[1] = 1;
// startingTranslation[2] = 1;

const scene = loader.loadScene(loader.defaultScene);
if (!scene) {
	throw new Error("A default scene is required to run this example");
}

const camera = scene.find((node) => node.getComponentOfType(Camera));
if (!camera) {
	throw new Error("A camera in the scene is require to run this example");
}

// camera.getComponentOfType(Transform).translation = {
// 	...whiteBall.node.getComponentOfType(Transform).translation,
// };

// camera.getComponentOfType(Transform).translation = [1.5, 1.5, 0, 0];

// console.log(camera.getComponentOfType(Transform).rotation);
// const rotation = quat.create();
// quat.rotateY(rotation, rotation, 1.6260000000000012);
// quat.rotateX(rotation, rotation, 0.14400000000000007);
// quat.rotateX(rotation, rotation, -0.5);
// quat.rotateY(rotation, rotation, 0.5);

// camera.getComponentOfType(Transform).rotation = rotation;
// console.log(camera.getComponentOfType(Transform).rotation);

// console.log(camera.getComponentOfType(Transform).translation);
// console.log(whiteBall.node.getComponentOfType(Transform).translation);

camera.addComponent(new FirstPersonController(camera, canvas));
/**
 * TODO: Add cue to be at the centre of camera and after collision resolution place the camera at the white ball's centre.
 */
// camera.addComponent(new Cue(camera, cue, 0));

function update(time, dt) {
	scene.traverse((node) => {
		for (const component of node.components) {
			// cue.getComponentOfType(Transform).translation =
			// 	camera.getComponentOfType(Transform).translation;
			// cue.getComponentOfType(Transform).translation.map((x, y, z) => [
			// 	x + 1,
			// 	y + 1,
			// 	z,
			// ]);
			// cue.components[0].rotation = camera.components[0].translation.map(
			// 	(x) => (x * Math.PI) / 2
			// );
			// cue.components[0].rotation = { ...camera.components[0].rotation };
			// cue.components[0].rotation[0] *= 0.4;
			// cue.components[0].rotation[1] *= 0;
			// cue.components[0].rotation[2] *= 0;
			// cue.components[0].translation = {
			// 	...camera.components[0].translation,
			// };
			// console.log(component.update?.(time, dt));
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
