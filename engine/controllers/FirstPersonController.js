import { quat, vec3, mat4 } from "glm";

import { Transform } from "../core/Transform.js";
import { Camera } from "../core/Camera.js";

export class FirstPersonController {
	constructor(
		node,
		domElement,
		{
			pitch = 0,
			yaw = 0,
			velocity = [0, 0, 0],
			acceleration = 25,
			maxSpeed = 2.5,
			decay = 0.9999,
			pointerSensitivity = 0.0015,
		} = {}
	) {
		this.node = node;
		this.domElement = domElement;

		this.keys = {};

		this.pitch = pitch;
		this.yaw = yaw;

		this.velocity = velocity;
		this.acceleration = acceleration;
		this.maxSpeed = maxSpeed;
		this.decay = decay;
		this.pointerSensitivity = pointerSensitivity;

		this.initHandlers();
	}

	initHandlers() {
		this.pointermoveHandler = this.pointermoveHandler.bind(this);
		this.keydownHandler = this.keydownHandler.bind(this);
		this.keyupHandler = this.keyupHandler.bind(this);

		const element = this.domElement;
		const doc = element.ownerDocument;

		doc.addEventListener("keydown", this.keydownHandler);
		doc.addEventListener("keyup", this.keyupHandler);

		element.addEventListener("click", (e) => element.requestPointerLock());
		doc.addEventListener("pointerlockchange", (e) => {
			if (doc.pointerLockElement === element) {
				doc.addEventListener("pointermove", this.pointermoveHandler);
			} else {
				doc.removeEventListener("pointermove", this.pointermoveHandler);
			}
		});
	}

	update(t, dt) {
		// Calculate forward and right vectors.
		const cos = Math.cos(this.yaw);
		const sin = Math.sin(this.yaw);
		const forward = [-sin, 0, -cos];
		const right = [cos, 0, -sin];

		// Map user input to the acceleration vector.
		const acc = vec3.create();
		if (this.keys["KeyW"]) {
			vec3.add(acc, acc, forward);
		}
		if (this.keys["KeyS"]) {
			vec3.sub(acc, acc, forward);
		}
		if (this.keys["KeyD"]) {
			vec3.add(acc, acc, right);
		}
		if (this.keys["KeyA"]) {
			vec3.sub(acc, acc, right);
		}

		if (this.keys["Space"]) {
		}
		// Update velocity based on acceleration.
		vec3.scaleAndAdd(
			this.velocity,
			this.velocity,
			acc,
			dt * this.acceleration
		);

		// If there is no user input, apply decay.
		if (
			!this.keys["KeyW"] &&
			!this.keys["KeyS"] &&
			!this.keys["KeyD"] &&
			!this.keys["KeyA"]
		) {
			const decay = Math.exp(dt * Math.log(1 - this.decay));
			vec3.scale(this.velocity, this.velocity, decay);
		}

		// Limit speed to prevent accelerating to infinity and beyond.
		const speed = vec3.length(this.velocity);
		if (speed > this.maxSpeed) {
			vec3.scale(this.velocity, this.velocity, this.maxSpeed / speed);
		}

		const transform = this.node.getComponentOfType(Transform);
		if (transform) {
			// Update translation based on velocity.
			vec3.scaleAndAdd(
				transform.translation,
				transform.translation,
				this.velocity,
				dt
			);

			// console.log(`[${this.pitch}, ${this.yaw}]`);

			// Update rotation based on the Euler angles.
			const rotation = quat.create();
			quat.rotateY(rotation, rotation, this.yaw);
			quat.rotateX(rotation, rotation, this.pitch);
			transform.rotation = rotation;
		}
	}

	pointermoveHandler(e) {
		const dx = e.movementX;
		const dy = e.movementY;

		this.pitch -= dy * this.pointerSensitivity;
		this.yaw -= dx * this.pointerSensitivity;

		const twopi = Math.PI * 2;
		const halfpi = Math.PI / 2;

		this.pitch = Math.min(Math.max(this.pitch, -halfpi), halfpi);
		this.yaw = ((this.yaw % twopi) + twopi) % twopi;
		// console.log(`Perspective matrix\n${this.node.getComponentOfType(Camera)?.perspectiveMatrix}`);
		// console.log(`Ortographic matrix\n${this.node.getComponentOfType(Camera)?.orthographicMatrix}`);
		console.log(`Projection matrix\n${this.node.getComponentOfType(Camera)?.projectionMatrix}`);
	}

	keydownHandler(e) {
		this.keys[e.code] = true;
		// console.log(this.node.getComponentOfType(Transform).matrix);
	}

	keyupHandler(e) {
		this.keys[e.code] = false;
	}
}
