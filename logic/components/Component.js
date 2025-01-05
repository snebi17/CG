import {
	calculateAxisAlignedBoundingBox,
	mergeAxisAlignedBoundingBoxes,
} from "../../engine/core/MeshUtils.js";
import { vec3 } from "../../lib/glm.js";

import { Model } from "../../engine/core.js";

export class Component {
	constructor(id, node) {
		this.id = id;
		this.node = node;

		this.setAxisAlignedBoundingBox();
	}

	setAxisAlignedBoundingBox() {
		this.model = this.node.getComponentOfType(Model);

		if (!this.model) {
			return;
		}

		const boxes = this.model.primitives.map((primitive) =>
			calculateAxisAlignedBoundingBox(primitive.mesh)
		);

		this.node.aabb = mergeAxisAlignedBoundingBoxes(boxes);
	}

	setCenter() {
		const { min, max } = this.node.aabb;
		const x = (max[0] + min[0]) / 2;
		const y = (max[1] + min[1]) / 2;
		const z = (max[2] + min[2]) / 2;

		return vec3.fromValues(x, y, z);
	}
}
