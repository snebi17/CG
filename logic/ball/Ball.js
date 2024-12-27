import { Transform } from "../../engine/core/Transform.js";

export class Ball {
	constructor(type, position) {
		this.node = node;
		this.id = id;
		this.type = type;
		this.position = position;
		this.isPotted = false;
	}

	move() {}

	resolveCollision() {}

	aabb() {}
}
