// import { Physics } from "../Physics";

export class Table {
	constructor(balls, pockets, edges) {
		this.pockets = pockets;
		this.edges = edges;

		this.balls = balls;
		this.pocketedBalls = [];
	}

	/**
	 * @param {*} ball - ball that's moving
	 * @returns true if ball has collided with another ball, false otherwise
	 * @todo optimize that it doesn't check for all the balls, just the balls in its direction
	 */
	checkCollision(ball) {
		this.balls.forEach((b) => {
			if (b !== ball && b.intersects(ball)) {
				return true;
			}
		});

		return false;
	}

	/**
	 * @param {*} ball
	 */
	resolveCollision(ball) {
		if (this.checkCollision(ball)) {
		}
	}

	pocketBall(ball) {
		this.activeBalls.filter((b) => b !== ball);
		this.pocketedBalls.push(ball);
	}
}
