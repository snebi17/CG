import * as EasingFunction from "../../engine/animators/EasingFunctions.js";
import { Transform, Model } from "../../engine/core.js";
import { vec3 } from "../../lib/glm.js";

import { Component } from "./Component.js";
import { BallMapping } from "../common/Mappings.js";

export class Ball extends Component {
	constructor(id, node) {
		super(id, node);

		this.init();
		this.node.addComponent(this);
	}

	init() {
		this.color = BallMapping[this.id].color;
		this.type = BallMapping[this.id].type;
		this.wasHit = false;
		this.isMoving = false;
		this.transform = this.node.getComponentOfType(Transform);
		this.velocity = vec3.fromValues(1, 0, 0);
		this.deceleration = 0.05;
		this.isPocketed = false;
		this.node.isDynamic = true;
	}

	move(vec) {
		// this.transform.translation = vec;
	}

	update(t, dt) {
		if (this.isPocketed) {
			// if it's pocketed, apply animation for translateY * dt
			// after a second, delete the ball
			this.pocketAnimation(dt);
		}
		// vec3.scaleAndAdd(this.velocity, this.velocity, vec3.fromValues(-1, 0, 0), this.deceleration * dt);

        // // If the velocity is very small, stop the ball
        // if (vec3.length(this.velocity) < 0.001) {
        //     this.velocity = vec3.create(); // Stop the ball
        // }

        // // Apply the velocity to move the ball
        // const transform = this.node.getComponentOfType(Transform);
        // if (transform) {
        //     const movement = vec3.create();
        //     vec3.scale(movement, this.velocity, dt); // Move the ball by the velocity over time
        //     vec3.add(transform.translation, transform.translation, movement);
        // }
		// if (this.wasHit) {
		// 	this.move(this.velocity);
		// 	this.isMoving = true;
		// } else {
		// 	this.isMoving = false;
		// }
		// this.transform.translation[0] += this.velocity[0];
	}

	pocketAnimation(dt) {
		this.transform.translation[1] *= dt;

		if (dt > 1) {
			this = null;
		}
	}
}
