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
	}

	setAxisAlignedBoundingBox() {
		this.model = this.node.getComponentOfType(Model);

		if (!this.model) {
			return;
		}

		const boxes = this.model.primitives.map((primitive) => calculateAxisAlignedBoundingBox(primitive.mesh));

		const aabb = mergeAxisAlignedBoundingBoxes(boxes);
		console.log(aabb);
		this.node.aabb = mergeAxisAlignedBoundingBoxes(boxes);
	}
}
