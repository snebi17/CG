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
		this.initialVelocity = [0, 0];
		this.isPotted = false;
		this.node.isDynamic = true;
	}

	move(vec) {
		// this.transform.translation = vec;
	}

	update(t, dt) {
		// if (this.wasHit) {
		// 	this.move(this.velocity);
		// 	this.isMoving = true;
		// } else {
		// 	this.isMoving = false;
		// }
		// this.transform.translation[0] += this.velocity[0];
	}
}
