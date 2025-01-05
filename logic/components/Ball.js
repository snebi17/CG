import { Transform, Model } from "../../engine/core.js";
import { vec3 } from "../../lib/glm.js";

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
		} = {}
	) {
		super(id, node);

		this.init();

		this.velocity = velocity;
		this.direction = direction;
		this.deceleration = deceleration;
		this.isMoving = isMoving;
		this.isPocketed = isPocketed;
	}

	init() {
		this.color = BallMapping[this.id].color;
		this.type = BallMapping[this.id].type;

		this.transform = this.node.getComponentOfType(Transform);

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

	move(dt) {
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
		vec3.scale(movement, this.velocity, dt);
		vec3.add(
			this.transform.translation,
			this.transform.translation,
			movement
		);
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
