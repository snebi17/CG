import { Model } from "../../engine/core.js";
import { vec3 } from "../../lib/glm.js";
import { EdgeMapping, EdgeNormalMapping } from "../common/Mappings.js";
import { Component } from "./Component.js";

export class Edge extends Component {
	constructor(id, node) {
		super(id, node, true);

		this.position = EdgeMapping[this.id];

		const pos = this.position.split(" ");
		this.normal = EdgeNormalMapping[pos[0]];

		console.log(this.normal);
		const model = this.node.getComponentOfType(Model);
		const mesh = model.primitives[0].mesh;
		// this.preprocessVertices(mesh.vertices);
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

	// preprocessVertices(vertices) {
	// 	let zones = [];
	// 	let currentZone = { type: "flat", vertices: [] };

	// 	for (let i = 0; i < vertices.length - 1; i++) {
	// 		const normal1 = vertices[i].normal;
	// 		const normal2 = vertices[i + 1].normal;

	// 		console.log(normal1);
	// 		console.log(normal2);
	// 		console.log(vec3.dot(normal1, normal2));

	// 		const dot = vec3.dot(normal1, normal2);
	// 		if (dot < 0.99) {
	// 			if (currentZone.type == "flat") {
	// 				zones.push(currentZone);
	// 				currentZone = { type: "rounded", vertices: [] };
	// 			}
	// 		} else {
	// 			if (currentZone.type == "rounded") {
	// 				zones.push(currentZone);
	// 				currentZone = { type: "flat", vertices: [] };
	// 			}
	// 		}

	// 		currentZone.vertices.push(i);
	// 	}

	// 	zones.push(currentZone);
	// 	console.log(zones);
	// 	return zones;
	// }
}
