import { Model } from "../../engine/core.js";
import { vec3 } from "../../lib/glm.js";
import { EdgeMapping } from "../common/Mappings.js";
import { EdgeNormals } from "../common/Enums.js";
import { Component } from "./Component.js";

export class Edge extends Component {
	constructor(id, node) {
		super(id, node, true);

		this.position = EdgeMapping[this.id];
		this.normal =
			EdgeNormals[
				this.position.split(" ").length > 1
					? this.position.split(" ")[0]
					: this.position
			];

		const model = this.node.getComponentOfType(Model);
		const mesh = model.primitives[0].mesh;
		for (const vertex of mesh.vertices) {
			console.log(vertex);
		}
	}

	resolveCollision(ball) {
		// const initialVelocity = ball.velocity;
		// const initialDirection = vec3.create();
		// vec3.normalize(initialDirection, initialVelocity);
		// const reflectedVelocity = vec3.create();
		const velocity = ball.velocity;
		const normal = vec3.fromValues(0, 0, -1);
		const dotProduct = vec3.dot(velocity, normal);
		vec3.scaleAndAdd(velocity, velocity, normal, -2 * dotProduct);
	}
}
