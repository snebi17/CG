export class Physics {
	constructor(ball) {
		this.ball = ball;
		this.velocity = [0, 0, 0];
		this.acceleration = [0, 0, 0];
	}

	applyMovement() {
		this.ball.position = this.ball.position.map(
			(pos, index) => pos + this.velocity[index]
		);
	}
}
