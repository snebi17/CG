import { Component } from "./Component.js";
import { PocketMapping } from "../common/Mappings.js";
import { vec3 } from "../../lib/glm.js";

export class Pocket extends Component {
	constructor(id, node) {
		super(id, node);

		this.position = PocketMapping[id];
		this.node.isStatic = true;

		const { min, max } = this.node.aabb;
		const x = (max[0] + min[0]) / 2;
		const y = (max[1] + min[1]) / 2;
		const z = (max[2] + min[2]) / 2;

		this.center = vec3.fromValues(x, y, z);


	}

	resolveCollision(ball) {
		if (ball.node.aabb < this.node.aabb) {
			ball.isPocketed = true;
			return true;
		}
	}
}
