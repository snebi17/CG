import {
	calculateAxisAlignedBoundingBox,
	mergeAxisAlignedBoundingBoxes,
} from "../../engine/core/MeshUtils.js";


import { Model, Transform } from "../../engine/core.js";

export class Component {
	constructor(id, node) {
		this.id = id;
		this.node = node;

		const model = this.node.getComponentOfType(Model);

		if (!model) {
			return;
		}

		const boxes = model.primitives.map((primitive) =>
			calculateAxisAlignedBoundingBox(primitive.mesh)
		);

		this.node.aabb = mergeAxisAlignedBoundingBoxes(boxes);
		this.position = this.node.getComponentOfType(Transform).translation;
	}
}
