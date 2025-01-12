import { Component } from "./Component.js";
import { PocketMapping } from "../common/Mappings.js";
import { vec3 } from "../../lib/glm.js";
import { Transform } from "../../engine/core.js";

export class Pocket extends Component {
	constructor(id, node) {
		super(id, node);

		this.location = PocketMapping[id];
		const diameter = Math.abs(this.node.aabb.max[2] - this.node.aabb.min[2]);
		this.radius = diameter / 6;

		if (this.id == 0) {
			this.position[0] -= .01;
			this.position[2] += .01;
		} else if (this.id == 1) {
			this.position[0] -= .01;
			this.position[2] -= .01;
		} else if (this.id == 2) {
			this.position[2] -= .01;
		} else if (this.id == 3) {
			this.position[0] += .01;
			this.position[2] -= .01;
		} else if (this.id == 4) {
			this.position[0] += .01;
			this.position[2] += .01;
		} else if (this.id == 5) {
			this.position[2] += .02;
		}
	}

	checkCollision(ball) {
		return vec3.squaredDistance(this.position, ball.node.getComponentOfType(Transform).translation) < this.radius;
	}
}
