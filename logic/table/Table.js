// import { IdBallMapping } from "../mappings/BallMappings.js";
// import { IdTableMapping } from "../mappings/TableMappings.js";

export class Table {
	constructor(balls, pockets, edges) {
		this.pockets = pockets;
		this.edges = edges;

		this.activeBalls = balls;
		this.pocketedBalls = [];
	}

	resolveCollision(ball) {}

	pocketBall(ball) {
		this.activeBalls.filter((b) => b !== ball);
		this.pocketedBalls.push(ball);
	}
}
