import { Component } from "./Component.js";
import { PocketMapping } from "../common/Mappings.js";

export class Pocket extends Component {
	constructor(id, node) {
		super(id, node, true);

		this.position = PocketMapping[id];
	}

	resolveCollision(ball) {
		if (ball.node.aabb < this.node.aabb) {
			ball.isPocketed = true;
			return true;
		}
	}
}
