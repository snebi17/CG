export class Physics {
	constructor(scene) {
		this.scene = scene;
	}

	update(t, dt) {
		this.scene.traverse((node) => {
			if (node.isDynamic) {
				this.scene.traverse((other) => {
					if (node !== other && other.isStatic) {
						this.resolveCollision(node, other);
					}
				});
			}
		});
	}
}
