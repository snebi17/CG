import { Model } from "../engine/core.js";
import { Transform } from "../engine/core/Transform.js";

export class Cue {
	constructor(camera, node) {
		this.camera = camera;
		this.node = node;
		// this.angle = angle;
		this.force = 0;

		console.log(this.node.getComponentOfType(Model));
	}

	update(dt, t) {
		const translate = this.node.getComponentOfType(Transform).translate;
		const rotation = this.node.getComponentOfType(Transform).rotation;

		this.camera.getComponentOfType(Transform).rotation;
	}
}
