import * as MeshUtils from "../../engine/core/MeshUtils.js";

export class Component {
	constructor(id, node) {
		this.id = id;
		this.node = node;
	}

	aabb() {
		return MeshUtils.calculateAxisAlignedBoundingBox(this.node);
	}

	merge(boxes) {
		return MeshUtils.mergeAxisAlignedBoundingBoxes(boxes);
	}
}
