// import { Physics } from "../Physics";

export class Table {
	constructor(balls, pockets, edges) {
		this.pockets = pockets;
		this.edges = edges;

		this.balls = balls;
		this.pocketedBalls = [];
	}

	resolveCollision(ball) {}

	pocketBall(ball) {
		this.activeBalls.filter((b) => b !== ball);
		this.pocketedBalls.push(ball);
	}
}
