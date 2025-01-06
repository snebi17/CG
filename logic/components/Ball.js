import { Transform, Model } from "../../engine/core.js";
import { vec3, mat4 } from "../../lib/glm.js";
import {
	getGlobalModelMatrix,
	getLocalModelMatrix,
	getGlobalViewMatrix,
	getLocalViewMatrix,
	getProjectionMatrix,
} from "../../engine/core/SceneUtils.js";

import { Component } from "./Component.js";
import { BallMapping } from "../common/Mappings.js";

export class Ball extends Component {
	constructor(
		id,
		node,
		{
			velocity = vec3.fromValues(0, 0, 0),
			direction = vec3.fromValues(0, 0, 0),
			deceleration = 0.4,
			isMoving = false,
			isPocketed = false,
			position = vec3.fromValues(0, 0, 0),
		} = {}
	) {
		super(id, node);

		this.init();

		this.position = position;
		this.velocity = velocity;
		this.direction = direction;
		this.deceleration = deceleration;
		this.isMoving = isMoving;
		this.isPocketed = isPocketed;
	}

	init() {
		this.color = BallMapping[this.id].color;
		this.type = BallMapping[this.id].type;

		const { min, max } = this.node.aabb;
		const x = (max[0] + min[0]) / 2;
		const y = (max[1] + min[1]) / 2;
		const z = (max[2] + min[2]) / 2;

		this.center = vec3.fromValues(x, y, z);
		this.radius = max[0] - min[0];
		this.node.isDynamic = true;
		this.node.addComponent(this);
	}

	hit(direction, velocity) {
		this.direction = direction;
		this.velocity = velocity;
		this.isMoving = true;
	}

	move(dt, modelMatrix = mat4.create()) {
		// const localMatrix = getLocalModelMatrix(this.node);
		// modelMatrix = mat4.multiply(mat4.create(), modelMatrix, localMatrix);
		// const normalMatrix = mat4.normalFromMat4(mat4.create(), modelMatrix);
		// console.log(normalMatrix);

		if (dt == undefined) {
			return;
		}

		if (vec3.length(this.velocity) < 0.01) {
			this.isMoving = false;
			return;
		}

		vec3.scaleAndAdd(
			this.velocity,
			this.velocity,
			this.direction,
			this.deceleration * dt
		);

		const movement = vec3.create();

		const transform = this.node.getComponentOfType(Transform);
		vec3.scale(movement, this.velocity, dt);
		vec3.add(transform.translation, transform.translation, movement);

		console.log(transform.matrix);
		// console.log(this.model.primitives[0].mesh.vertices[0].position);
		console.log(this.normalMatrix);
	}

	update(t, dt, modelMatrix = mat4.create()) {
		if (this.isPocketed) {
			// if it's pocketed, apply animation for translateY * dt
			// after a second, delete the ball
			this.pocketAnimation(dt);
		}

		if (this.isMoving) {
			this.move(dt);
		}

		const localMatrix = getLocalModelMatrix(this.node);
		modelMatrix = mat4.multiply(mat4.create(), modelMatrix, localMatrix);
		this.normalMatrix = mat4.normalFromMat4(mat4.create(), modelMatrix);
	}

	pocketAnimation(dt) {
		this.transform.translation[1] -= dt;
		console.log(this.transform.translation);
	}
}
