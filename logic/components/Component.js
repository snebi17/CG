import {
	calculateAxisAlignedBoundingBox,
	mergeAxisAlignedBoundingBoxes,
	transformMesh,
} from "../../engine/core/MeshUtils.js";

import {
	getGlobalModelMatrix,
	getGlobalViewMatrix,
	getLocalModelMatrix,
	getLocalViewMatrix,
} from "../../engine/core/SceneUtils.js";
import { mat4, vec3 } from "../../lib/glm.js";

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

		const aabb = this.node.aabb;
		const x = (aabb.max[0] + aabb.min[0]) / 2;
		const z = (aabb.max[1] + aabb.min[1]) / 2;

		this.position = vec3.fromValues(x, 0, z);
	}
}
