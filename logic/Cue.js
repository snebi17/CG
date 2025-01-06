import { Model } from "../engine/core.js";
import { Transform } from "../engine/core/Transform.js";

export class Cue {
	constructor(camera, node, { angle = 0, force = 0 }) {
		this.camera = camera;
		this.node = node;
		// this.angle = angle;

		this.transform = this.node.getComponentOfType(Transform);
		this.force = 0;
	}

	update(dt, t) {
		const cameraTransform = this.camera.getComponentOfType(Transform);
	}
}
