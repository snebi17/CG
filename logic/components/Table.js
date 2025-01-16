import { Transform } from "../../engine/core.js";
import { getGlobalModelMatrix } from "../../engine/core/SceneUtils.js";
import { vec3 } from "../../lib/glm.js";
import { Ball } from "./Ball.js";
import { Edge } from "./Edge.js";

export class Table {
	constructor(
		balls,
		edges,
		pockets,
		{
			movingBalls = [],
			pocketedBalls = [],
			frictionCoefficient = 0.2,
			isStationary = true,
			firstHit = null,
		} = {}
	) {
		this.balls = balls;
		this.edges = edges;
		this.pockets = pockets;
		this.frictionCoefficient = frictionCoefficient;

		this.transform;

		this.movingBalls = movingBalls;
		this.pocketedBalls = pocketedBalls;
		this.firstHit = firstHit;
		this.isStationary = isStationary;
	}

	update(t, dt) {
		this.movingBalls = this.balls.filter((ball) => ball.isMoving);

		if (this.movingBalls.length == 0) {
			this.isStationary = true;
			return;
		}

		this.isStationary = false;

		this.movingBalls.forEach((ball) => {
			this.balls.forEach((other) => {
				if (ball != other) {
					this.handleBounce(dt, ball, other);
				}
			});

			this.edges.forEach((edge) => {
				this.handleBounce(dt, ball, edge);
			});
			this.pockets.forEach((pocket) => {
				this.handlePocketing(ball, pocket);
			});
		});
	}

	handlePocketing(ball, pocket) {
		if (pocket.checkCollision(ball)) {
			ball.isPocketed = true;
			if (!this.pocketedBalls.includes(ball)) {
				console.log(ball);
				this.pocketedBalls.push(ball);
			}
		}
	}

	handleBounce(dt, ball, other) {
		if (this.resolveCollision(ball.node, other.node)) {
			const speed = vec3.length(ball.velocity);

			if (speed < 0.015) {
				vec3.zero(ball.velocity);
				ball.isMoving = false;
				return;
			}

			if (other instanceof Ball) {
				const normal = vec3.create();
				vec3.subtract(normal, other.position, ball.position);
				vec3.normalize(normal, normal);

				if (this.firstHit == null) {
					this.firstHit = other;
				}

				if (other.isMoving) {
					const dot1 = vec3.dot(ball.velocity, normal);
					const dot2 = vec3.dot(other.velocity, normal);

					const velocity1 = vec3.create();
					const velocity2 = vec3.create();

					vec3.scale(velocity1, normal, dot1);
					vec3.subtract(ball.velocity, ball.velocity, velocity1);

					vec3.scale(velocity2, normal, dot2);
					vec3.subtract(other.velocity, other.velocity, velocity2);

					vec3.add(ball.velocity, ball.velocity, velocity2);
					vec3.add(other.velocity, other.velocity, velocity1);
				} else {
					const dot = vec3.dot(ball.velocity, normal);
					const velocity = vec3.create();
					vec3.scale(velocity, normal, dot);
					vec3.subtract(ball.velocity, ball.velocity, velocity);

					vec3.scale(normal, normal, speed);
					other.hit(normal);
				}
			} else if (other instanceof Edge) {
				const normal = vec3.create();
				vec3.copy(normal, other.normal);
				vec3.normalize(normal, normal);

				const dotProduct = vec3.dot(ball.velocity, normal);
				vec3.scaleAndAdd(
					ball.velocity,
					ball.velocity,
					normal,
					-2 * dotProduct
				);

				vec3.scale(
					ball.velocity,
					ball.velocity,
					1 - this.frictionCoefficient
				);
				vec3.scale(
					ball.velocity,
					ball.velocity,
					1 - ball.deceleration * dt
				);

				const clampedSpeed = Math.min(
					speed,
					vec3.length(ball.velocity)
				);
				vec3.scale(
					ball.velocity,
					ball.velocity,
					clampedSpeed / vec3.length(ball.velocity)
				);
			}
		}
	}

	reset() {
		this.firstHit = null;
		this.pocketedBalls = [];
	}

	getStatus() {
		return { firstHit: this.firstHit, pocketedBalls: this.pocketedBalls };
	}

	intervalIntersection(min1, max1, min2, max2) {
		return !(min1 > max2 || min2 > max1);
	}

	aabbIntersection(aabb1, aabb2) {
		return (
			this.intervalIntersection(
				aabb1.min[0],
				aabb1.max[0],
				aabb2.min[0],
				aabb2.max[0]
			) &&
			this.intervalIntersection(
				aabb1.min[1],
				aabb1.max[1],
				aabb2.min[1],
				aabb2.max[1]
			) &&
			this.intervalIntersection(
				aabb1.min[2],
				aabb1.max[2],
				aabb2.min[2],
				aabb2.max[2]
			)
		);
	}

	getTransformedAABB(node) {
		// Transform all vertices of the AABB from local to global space.
		const matrix = getGlobalModelMatrix(node);
		const { min, max } = node.aabb;
		const vertices = [
			[min[0], min[1], min[2]],
			[min[0], min[1], max[2]],
			[min[0], max[1], min[2]],
			[min[0], max[1], max[2]],
			[max[0], min[1], min[2]],
			[max[0], min[1], max[2]],
			[max[0], max[1], min[2]],
			[max[0], max[1], max[2]],
		].map((v) => vec3.transformMat4(v, v, matrix));

		// Find new min and max by component.
		const xs = vertices.map((v) => v[0]);
		const ys = vertices.map((v) => v[1]);
		const zs = vertices.map((v) => v[2]);
		const newmin = [Math.min(...xs), Math.min(...ys), Math.min(...zs)];
		const newmax = [Math.max(...xs), Math.max(...ys), Math.max(...zs)];
		return { min: newmin, max: newmax };
	}

	resolveCollision(a, b) {
		// Get global space AABBs.
		const aBox = this.getTransformedAABB(a);
		const bBox = this.getTransformedAABB(b);

		// Check if there is collision.
		const isColliding = this.aabbIntersection(aBox, bBox);
		if (!isColliding) {
			return false;
		}

		// Move node A minimally to avoid collision.
		const diffa = vec3.sub(vec3.create(), bBox.max, aBox.min);
		const diffb = vec3.sub(vec3.create(), aBox.max, bBox.min);

		let minDiff = Infinity;
		let minDirection = [0, 0, 0];
		if (diffa[0] >= 0 && diffa[0] < minDiff) {
			minDiff = diffa[0];
			minDirection = [minDiff, 0, 0];
		}
		if (diffa[1] >= 0 && diffa[1] < minDiff) {
			minDiff = diffa[1];
			minDirection = [0, minDiff, 0];
		}
		if (diffa[2] >= 0 && diffa[2] < minDiff) {
			minDiff = diffa[2];
			minDirection = [0, 0, minDiff];
		}
		if (diffb[0] >= 0 && diffb[0] < minDiff) {
			minDiff = diffb[0];
			minDirection = [-minDiff, 0, 0];
		}
		if (diffb[1] >= 0 && diffb[1] < minDiff) {
			minDiff = diffb[1];
			minDirection = [0, -minDiff, 0];
		}
		if (diffb[2] >= 0 && diffb[2] < minDiff) {
			minDiff = diffb[2];
			minDirection = [0, 0, -minDiff];
		}

		const transform = a.getComponentOfType(Transform);
		if (!transform) {
			return false;
		}

		vec3.add(transform.translation, transform.translation, minDirection);

		return true;
	}
}
