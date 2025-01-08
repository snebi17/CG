import { Transform, Model } from "../../engine/core.js";
import { vec3, mat4 } from "../../lib/glm.js";

import { Component } from "./Component.js";
import { BallMapping } from "../common/Mappings.js";

export class Ball extends Component {
	constructor(
		id,
		node,
		{
			velocity = vec3.create(),
			direction = vec3.create(),
			deceleration = 0.4,
			isMoving = false,
			isPocketed = false,
			position = vec3.create(),
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

		this.node.isDynamic = true;
		this.node.addComponent(this);
	}

	hit(velocity = vec3.create(), direction = vec3.create()) {
		vec3.random(this.velocity);
		vec3.random(this.direction);
		this.velocity[1] = 0;
		this.direction[1] = 0;

		console.log(this.velocity)
		console.log(this.direction)
		this.isMoving = true;
	}

	move(dt) {
		if (dt == undefined) {
			return;
		}

		if (vec3.length(this.velocity) < 0.01) {
			this.velocity = vec3.create();
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
		this.transform.translation[1] -= dt;
		console.log(this.transform.translation);
	}
}
