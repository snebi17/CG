import { Component } from "./Component.js";
import { PocketMapping } from "../common/Mappings.js";

export class Pocket extends Component {
	constructor(id, node) {
		super(id, node);

		this.position = PocketMapping[id];
		this.node.isStatic = true;
	}

	resolveCollision(ball) {
		ball.isPocketed = true;
		return true;
	}
}
