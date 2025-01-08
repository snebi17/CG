import { Component } from "./Component.js";

export class Edge extends Component {
	constructor(id, node) {
		super(id, node);

		this.node.isStatic = true;

	}

	resolveCollision(ball) {
		
	}
}
