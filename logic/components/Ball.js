import { Transform } from "../../engine/core.js";
import { mat4, vec3 } from "../../lib/glm.js";

import { Component } from "./Component.js";
import { BallMapping } from "../common/Mappings.js";

import {
	getGlobalModelMatrix,
	getGlobalViewMatrix,
	getLocalModelMatrix,
	getLocalViewMatrix,
} from "../../engine/core/SceneUtils.js";

export class Ball extends Component {
	constructor(
		id,
		node,
		{
			ballMapping = BallMapping[id],

			velocity = vec3.create(),
			deceleration = 0.4,

			isMoving = false,
			isPocketed = false,
		} = {}
	) {
		super(id, node, false);

		this.color = ballMapping.color;
		this.type = ballMapping.type;
		this.node.addComponent(this);

		this.velocity = velocity;
		this.deceleration = deceleration;

		this.isMoving = isMoving;
		this.isPocketed = isPocketed;
	}

	hit(velocity) {
		this.velocity = velocity;
		this.velocity[1] = 0;
		this.isMoving = true;
	}

	move(dt) {
		if (dt == undefined) {
			return;
		}

		const speed = vec3.length(this.velocity);
		if (speed < 0.015) {
			vec3.zero(this.velocity);
			this.isMoving = false;
			return;
		}

		const velocity = vec3.copy(vec3.create(), this.velocity);
		vec3.scale(this.velocity, this.velocity, 1 - this.deceleration * dt);

		const deltaVelocity = vec3.sub(vec3.create(), velocity, this.velocity);

		const movement = vec3.create();
		const transform = this.node.getComponentOfType(Transform);

		vec3.scale(movement, this.velocity, this.deceleration * dt);
		vec3.add(transform.translation, transform.translation, movement);
		vec3.add(this.position, this.position, deltaVelocity);
	}

	update(t, dt) {
		if (this.isPocketed) {
			// if it's pocketed, apply animation for translateY * dt
			// after a second, delete the ball
			this.pocketAnimation(dt);
		}

		if (this.isMoving) {
			this.move(dt);
		}
	}

	pocketAnimation(dt) {
		this.velocity = vec3.fromValues(0, dt, 0);
		const transform = this.node.getComponentOfType(Transform);

		vec3.sub(transform.translation, transform.translation, this.velocity);
	}
}
