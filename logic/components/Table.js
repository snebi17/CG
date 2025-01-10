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
		{ movingBalls = [], pocketedBalls = [], frictionCoefficient = 0.2 } = {}
	) {
		this.balls = balls;
		this.edges = edges;
		this.pockets = pockets;
		this.frictionCoefficient = frictionCoefficient;

		this.transform;

		this.movingBalls = movingBalls;
		this.pocketedBalls = pocketedBalls;
	}

	update(t, dt) {
		this.balls.forEach((ball) => {
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
		// const ballBox = this.getTransformedAABB(ball.node);
		// const pocketBox = this.getTransformedAABB(pocket.node);
		// const isColliding = this.aabbIntersection(ballBox, pocketBox);
		// if (isColliding) {
		// 	ball.isPocketed = true;
		// 	this.pocketedBalls.push(ball);
		// }
	}

	handleBounce(dt, ball, other) {
		if (this.resolveCollision(ball.node, other.node)) {
			const velocity = vec3.copy(vec3.create(), ball.velocity);
			const speed = vec3.length(velocity);

			if (speed < 0.01) {
				vec3.zero(velocity);
				ball.velocity = velocity;
				return;
			}

			if (other instanceof Ball) {
				/**
				 * Ball to ball collision
				 * Calculate kinetic energy and momentum the ball gives to another ball when collision occurs
				 */
				// the angle between balls position vector on X axis
				// console.log(ball.position);
				console.log(other.position);
				const ballPosition = vec3.copy(vec3.create(), ball.position);
				const otherPosition = vec3.copy(vec3.create(), other.position);

				// Compute the vector between the centers
				const collisionVector = vec3.create();
				vec3.subtract(collisionVector, otherPosition, ballPosition);

				// Normalize the collision vector
				const collisionNormal = vec3.create();
				vec3.normalize(collisionNormal, collisionVector);

				// Compute the cosine of the angle
				const speed = vec3.length(velocity);
				const cosTheta = vec3.dot(velocity, collisionNormal) / speed;

				// Compute the angle (in radians)
				const angle = Math.acos(cosTheta);
				console.log(angle);
				// const phi = Math.random();
				// // the angle between balls p
				// position vector on Z axis
				// const theta = Math.random();

				// // get collision normal (vector that starts from ball's position to other's position)
				// const negatedVelocity = vec3.create();
				// vec3.negate(negatedVelocity, velocity);
				// vec3.scale(negatedVelocity, negatedVelocity, 0.8);
				// vec3.rotateX(
				// 	negatedVelocity,
				// 	negatedVelocity,
				// 	ball.position,
				// 	phi
				// );
				// vec3.rotateZ(
				// 	negatedVelocity,
				// 	negatedVelocity,
				// 	ball.position,
				// 	theta
				// );

				// ball.hit(negatedVelocity);
				// const conservedVelocity = vec3.create();
				// vec3.scale(conservedVelocity, velocity, 0.8);
				// vec3.rotateX(
				// 	conservedVelocity,
				// 	conservedVelocity,
				// 	ball.position,
				// 	phi
				// );
				// vec3.rotateZ(
				// 	conservedVelocity,
				// 	conservedVelocity,
				// 	ball.position,
				// 	theta
				// );
				// other.hit(conservedVelocity);
			} else if (other instanceof Edge) {
				/**
				 * Ball to edge collision
				 * Calculate velocity and direction in which the ball should move after collision with an edge
				 */
				const normal = vec3.copy(vec3.create(), other.normal);
				const dotProduct = vec3.dot(velocity, normal);
				vec3.scaleAndAdd(velocity, velocity, normal, -2 * dotProduct);
				vec3.scale(velocity, velocity, 1 - this.frictionCoefficient);
				ball.hit(velocity);
			}
		}
	}

	calculateCollisionAngle(ball, other) {}

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
