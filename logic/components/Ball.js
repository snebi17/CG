import { Transform } from "../../engine/core.js";
import { vec3 } from "../../lib/glm.js";

import { Component } from "./Component.js";
import { BallMapping } from "../common/Mappings.js";

export class Ball extends Component {
	constructor(
		id,
		node,
		{
			ballMapping = BallMapping[id],

			velocity = vec3.create(),
			position = vec3.create(),
			deceleration = 0.4,

			isMoving = false,
			isPocketed = false,
		} = {}
	) {
		super(id, node, false);

		this.color = ballMapping.color;
		this.type = ballMapping.type;
		this.node.addComponent(this);

		this.position = position;
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

		if (vec3.length(this.velocity) < 0.01) {
			this.velocity = vec3.create();
			this.isMoving = false;
			return;
		}

		vec3.scaleAndAdd(
			this.velocity,
			this.velocity,
			this.velocity,
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
		const transform = this.node.getComponentOfType(Transform);

		vec3.sub(
			transform.translation,
			transform.translation,
			vec3.fromValues(0, dt, 0)
		);
	}
}
