import {
	calculateAxisAlignedBoundingBox,
	mergeAxisAlignedBoundingBoxes,
} from "../../engine/core/MeshUtils.js";
import { vec3 } from "../../lib/glm.js";

import { Model, Transform } from "../../engine/core.js";

export class Component {
	constructor(id, node) {
		this.id = id;
		this.node = node;
		this.transform = this.node.getComponentOfType(Transform);
		this.model = this.node.getComponentOfType(Model);

		this.setAxisAlignedBoundingBox();
		this.setCenter();

	}

	setAxisAlignedBoundingBox() {
		this.model = this.node.getComponentOfType(Model);

		if (!this.model) {
			return;
		}

		const boxes = this.model.primitives.map((primitive) => {
			for (const vertex of primitive.mesh.vertices) {
				// console.log(vertex.position);
				// vec3.rotateY(vertex.position, vertex.position, vec3.fromValues(0, 0, 0, 1), this.transform.rotation[2]);
				// vec3.rotateZ(vertex.position, vertex.position, vec3.fromValues(0, 0, 0, 1), this.transform.rotation[3]);
			}
			// console.log(primitive.mesh.vertices);
			return calculateAxisAlignedBoundingBox(primitive.mesh);
		});

		this.node.aabb = mergeAxisAlignedBoundingBoxes(boxes);
	}

	setCenter() {
		const { min, max } = this.node.aabb;
		const x = (max[0] + min[0]) / 2;
		const y = (max[1] + min[1]) / 2;
		const z = (max[2] + min[2]) / 2;

		this.center = vec3.fromValues(x, y, z);
	}
}
