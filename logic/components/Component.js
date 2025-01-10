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

		const transformMatrix = this.node.getComponentOfType(Transform).matrix;
		const modelMatrix = model;

		// console.log(modelMatrix.primitives[0].mesh);
		// transformMesh(modelMatrix.primitives[0].mesh, transformMatrix);
		// console.log(modelMatrix.primitives[0].mesh);

		const boxes = model.primitives.map((primitive) =>
			calculateAxisAlignedBoundingBox(primitive.mesh)
		);

		this.node.aabb = mergeAxisAlignedBoundingBoxes(boxes);

		const aabb = this.node.aabb;
		const x = (aabb.max[0] + aabb.min[0]) / 2;
		const y = (aabb.max[1] + aabb.min[1]) / 2;
		const z = (aabb.max[2] + aabb.min[2]) / 2;

		this.position = vec3.fromValues(x, y, z);
	}
}
