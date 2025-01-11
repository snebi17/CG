import { quat, vec3, mat4 } from "glm"; // **CHANGE**: Added mat4 for matrix operations
import { Transform } from "../core/Transform.js";

export class OrbitController2 {
	constructor(
		node,
		domElement,
		{
			rotation = [0, 0, 0, 1],
			distance = [0, .2, 1.2],
			moveSensitivity = 0.0015,
			zoomSensitivity = 0.002,
			keys = {}
		} = {}
	) {
		this.node = node;
		this.domElement = domElement;

		this.rotation = rotation;
		this.distance = distance;

		this.moveSensitivity = moveSensitivity;
		this.zoomSensitivity = zoomSensitivity;

		this.keys = keys,

		this.initHandlers();

		// **CHANGE**: Added target property to define the object to orbit around
		// this.target = [1.5, -0.25, 0.41999998688697815]; // Object or position [x, y, z]
        // this.target = [0.41999998688697815, 1.5, -0.25];
        this.target = null;
	}

	initHandlers() {
		this.wheelHandler = this.wheelHandler.bind(this);

		this.keydownHandler = this.keydownHandler.bind(this);
		this.keyupHandler = this.keyupHandler.bind(this);

		const element = this.domElement;
		const doc = element.ownerDocument;

		doc.addEventListener("keydown", this.keydownHandler);
		doc.addEventListener("keyup", this.keyupHandler);

		element.addEventListener("wheel", this.wheelHandler);
	}

	keydownHandler(e) {
		this.keys[e.code] = true;
	}

	keyupHandler(e) {
		this.keys[e.code] = false;
	}

	wheelHandler(e) {
		this.distance[2] *= Math.exp(this.zoomSensitivity * e.deltaY);
	}

	// **CHANGE**: Updated the `update` method to orbit around the target
	update(dt) {
		const transform = this.node.getComponentOfType(Transform);
		if (!transform) {
			return;
		}

		if (!this.target) {
			console.warn("OrbitController: No target specified.");
			return;
		}

		// **CHANGE**: Get target position (if target is a Transform, extract position)
		let targetPosition;
		if (this.target instanceof Transform) {
			targetPosition = this.target.translation;
		} else if (Array.isArray(this.target)) {
			targetPosition = this.target;
		} else {
			throw new Error("OrbitController: Invalid target type.");
		}
		
		let dx = 0;

		if (this.keys["KeyD"]) {
			dx += dt * this.moveSensitivity;
		}
		if (this.keys["KeyA"]) {
			dx -= dt * this.moveSensitivity;
		}

		quat.rotateY(this.rotation, this.rotation, -dx);
		quat.normalize(this.rotation, this.rotation);

		// Create matrices for transformation
		const targetMatrix = mat4.create();
		const rotationMatrix = mat4.create();
		// const translationMatrix = mat4.create();

		// Translate to the target position
		mat4.translate(targetMatrix, targetMatrix, targetPosition);

		// Apply rotation
		mat4.fromQuat(rotationMatrix, this.rotation);
		mat4.multiply(targetMatrix, targetMatrix, rotationMatrix);

		// Move outward by the orbit distance
		mat4.translate(targetMatrix, targetMatrix, this.distance);

		// **CHANGE**: Extract translation and rotation from the resulting matrix
		mat4.getTranslation(transform.translation, targetMatrix);
		mat4.getRotation(transform.rotation, targetMatrix);
	}

	// **CHANGE**: Added method to set the orbit target
	setTarget(target) {
		this.target = target;
	}
}
