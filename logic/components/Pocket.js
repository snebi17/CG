import { Component } from "./Component.js";
import { PocketMapping } from "../common/Mappings.js";
import { vec3 } from "../../lib/glm.js";
import { Transform } from "../../engine/core.js";

export class Pocket extends Component {
	constructor(id, node) {
		super(id, node, true);

		this.location = PocketMapping[id];
		const diameter = Math.abs(this.node.aabb.max[2] - this.node.aabb.min[2]);
		this.radius = diameter / 2;
	}

	checkCollision(ball) {	
		return vec3.squaredDistance(this.position, ball.node.getComponentOfType(Transform).translation) < this.radius;
	}
}
