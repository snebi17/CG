import { Transform } from "../../engine/core.js";
import { IdBallMapping } from "../mappings/BallMappings.js";

export class Ball {
	constructor(id, node) {
		this.node = node;
		this.addLinearAnimator();

		this.id = id;
		this.setColorAndType(this.id);

		this.move.bind(this);
		this.move();

		this.position = this.node.getComponentOfType(Transform).translation;
		this.isPotted = false;
	}

	addLinearAnimator() {
		if (this.endNode == null) {
			return;
		}

		// const startPosition = mat4.getTranslation(
		// 	vec3.create(),
		// 	getGlobalModelMatrix(this.node)
		// );

		// const endPosition = mat4.getTranslation(
		// 	vec3.create(),
		// 	getGlobalModelMatrix(this.endNode)
		// );

		// const transform = this.node.getComponentOfType(Transform);

		// this.node.addComponent({
		// 	update(t, dt) {
		// 		const time = t % 1;
		// 		vec3.lerp(
		// 			transform.translation,
		// 			startPosition,
		// 			endPosition,
		// 			EasingFunctions.bounceEaseOut(time)
		// 		);
		// 	},
		// });
	}

	setColorAndType(id) {
		this.color = IdBallMapping[id].color;
		this.type = IdBallMapping[id].type;
	}

	move() {
		for (let i = 0; i < 1000000; i += 0.01) {}
	}

	resolveCollision() {}

	aabb() {}
}
