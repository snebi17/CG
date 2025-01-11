import { quat, vec3, mat4 } from "glm"; // **CHANGE**: Added mat4 for matrix operations
import { Transform } from "../core/Transform.js";

export class OrbitController2 {
	constructor(
		node,
		domElement,
		{
			rotation = [0, 0.7, 0, 0.7],
			distance = 1,
			moveSensitivity = 0.004,
			zoomSensitivity = 0.002,
		} = {}
	) {
		this.node = node;
		this.domElement = domElement;

		this.rotation = rotation;
		this.distance = distance;

		this.moveSensitivity = moveSensitivity;
		this.zoomSensitivity = zoomSensitivity;

		this.initHandlers();

		// **CHANGE**: Added target property to define the object to orbit around
		// this.target = [1.5, -0.25, 0.41999998688697815]; // Object or position [x, y, z]
        // this.target = [0.41999998688697815, 1.5, -0.25];
        this.target = null;
	}

	initHandlers() {
		this.pointerdownHandler = this.pointerdownHandler.bind(this);
		this.pointerupHandler = this.pointerupHandler.bind(this);
		this.pointermoveHandler = this.pointermoveHandler.bind(this);
		this.wheelHandler = this.wheelHandler.bind(this);

		this.domElement.addEventListener(
			"pointerdown",
			this.pointerdownHandler
		);
		this.domElement.addEventListener("wheel", this.wheelHandler);
	}

	pointerdownHandler(e) {
		this.domElement.setPointerCapture(e.pointerId);
		this.domElement.requestPointerLock();
		this.domElement.removeEventListener(
			"pointerdown",
			this.pointerdownHandler
		);
		this.domElement.addEventListener("pointerup", this.pointerupHandler);
		this.domElement.addEventListener(
			"pointermove",
			this.pointermoveHandler
		);
	}

	pointerupHandler(e) {
		this.domElement.releasePointerCapture(e.pointerId);
		this.domElement.ownerDocument.exitPointerLock();
		this.domElement.addEventListener(
			"pointerdown",
			this.pointerdownHandler
		);
		this.domElement.removeEventListener("pointerup", this.pointerupHandler);
		this.domElement.removeEventListener(
			"pointermove",
			this.pointermoveHandler
		);
	}

	pointermoveHandler(e) {
		const dx = e.movementX;
		const dy = e.movementY;

		quat.rotateX(this.rotation, this.rotation, -dy * this.moveSensitivity);
		quat.rotateY(this.rotation, this.rotation, -dx * this.moveSensitivity);
		quat.normalize(this.rotation, this.rotation);
	}

	wheelHandler(e) {
		this.distance *= Math.exp(this.zoomSensitivity * e.deltaY);
	}

	// **CHANGE**: Updated the `update` method to orbit around the target
	update() {
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

		// Create matrices for transformation
		const targetMatrix = mat4.create();
		const rotationMatrix = mat4.create();
		const translationMatrix = mat4.create();

		// Translate to the target position
		mat4.translate(targetMatrix, targetMatrix, targetPosition);

		// Apply rotation
		mat4.fromQuat(rotationMatrix, this.rotation);
		mat4.multiply(targetMatrix, targetMatrix, rotationMatrix);

		// Move outward by the orbit distance
		mat4.translate(targetMatrix, targetMatrix, [0, 0, this.distance]);

		// **CHANGE**: Extract translation and rotation from the resulting matrix
		mat4.getTranslation(transform.translation, targetMatrix);
		mat4.getRotation(transform.rotation, targetMatrix);
		console.log(this.rotation);
	}

	// **CHANGE**: Added method to set the orbit target
	setTarget(target) {
		this.target = target;
	}
}
