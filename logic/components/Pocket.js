import { Component } from "./Component.js";
import { PocketMapping } from "../common/Mappings.js";

export class Pocket extends Component {
	constructor(id, node) {
		super(id, node);

		this.position = PocketMapping[id];
		this.node.isStatic = true;
	}

	resolveCollision(ball) {
		if (ball.node.aabb < this.node.aabb) {
			ball.isPocketed = true;
			return true;
		}
	}
}
