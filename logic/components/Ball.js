import * as EasingFunction from "../../engine/animators/EasingFunctions.js";
import { Transform } from "../../engine/core.js";
import { vec3 } from "../../lib/glm.js";

import { Component } from "./Component.js";
import { BallMapping } from "../common/Mappings.js";

export class Ball extends Component {
	constructor(id, node) {
		super(id, node);

		this.init();
		this.addLinearAnimator.bind(this);
	}

	init() {
		this.color = BallMapping[this.id].color;
		this.type = BallMapping[this.id].type;

		this.transform = this.node.getComponentOfType(Transform);
		this.velocity = [0, 0, 0];
		this.isPotted = false;
	}

	update(t, dt) {
		const time = t % 1;
		vec3.lerp(
			this.transform.translation,
			this.transform.translation,
			[0, 1, 0, 1],
			EasingFunction.bounceEaseIn
		);
	}

	addLinearAnimator() {
		this.node.addComponent({ update });
	}
}
