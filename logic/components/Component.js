import {
	calculateAxisAlignedBoundingBox,
	mergeAxisAlignedBoundingBoxes,
} from "../../engine/core/MeshUtils.js";

import { Model } from "../../engine/core.js";

export class Component {
	constructor(id, node) {
		this.id = id;
		this.node = node;

		this.setAxisAlignedBoundingBox(node);
	}

	setAxisAlignedBoundingBox(node) {
		this.model = node.getComponentOfType(Model);

		if (!this.model) {
			return;
		}

		const boxes = this.model.primitives.map((primitive) =>
			calculateAxisAlignedBoundingBox(primitive.mesh)
		);

		this.node.aabb = mergeAxisAlignedBoundingBoxes(boxes);
	}
}
