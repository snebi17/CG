import { Transform } from "../../engine/core.js";
import { getGlobalModelMatrix } from "../../engine/core/SceneUtils.js";
import { vec3 } from "../../lib/glm.js";
import { Ball } from "./Ball.js";

export class Table {
	constructor(
		balls,
		edges,
		pockets,
		{ movingBalls = [], pocketedBalls = [], frictionCoefficient = 0.2 } = {}
	) {
		this.balls = balls;
		this.edges = edges;
		this.pockets = pockets;
		this.frictionCoefficient = frictionCoefficient;

		this.movingBalls = movingBalls;
		this.pocketedBalls = pocketedBalls;
	}

	update(t, dt) {
		this.balls.forEach((ball) => {
			if (ball.isMoving) {
				this.movingBalls.push(ball);
			}

			this.edges.forEach((edge) => {
				this.handleBounce(dt, ball, edge);
			});
			this.pockets.forEach((pocket) => {
				this.handlePocketing(ball, pocket);
			});
		});
	}

	handlePocketing(ball, pocket) {
		if (this.resolveCollision(ball.node, pocket.node)) {
			console.log(pocket);
			this.pocketedBalls.push(ball);
		}
	}

	handleBounce(dt, ball, other) {
		if (this.resolveCollision(ball.node, other.node)) {
			const velocity = ball.velocity;
			const speed = vec3.length(velocity);
			if (speed < 0.01) {
				vec3.set(velocity, 0, 0, 0);
				return;
			}

			if (other instanceof Ball) {
				/**
				 * Ball to ball collision
				 * Calculate kinetic energy and momentum the ball gives to another ball when collision occurs
				 */
				ball.move(vec3.fromValues(-1, 0, 0), vec3.fromValues(1, 0, 0));
				other.hit();
			} else {
				/**
				 * Ball to edge collision
				 * Calculate velocity and direction in which the ball should move after collision with an edge
				 */
				const normal = other.normal;
				const dotProduct = vec3.dot(velocity, normal);
				vec3.scaleAndAdd(velocity, velocity, normal, -2 * dotProduct);
				vec3.scale(velocity, velocity, 1 - this.frictionCoefficient);
				vec3.scale(velocity, velocity, 1 - ball.deceleration * dt);
				const clampedSpeed = Math.min(speed, vec3.length(velocity));
				vec3.scale(
					velocity,
					velocity,
					clampedSpeed / vec3.length(velocity)
				);
				console.log(velocity);
			}
		}
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
