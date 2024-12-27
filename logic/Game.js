// import { IdTableMapping } from "./mappings/TableMappings.js";
// import { IdBallMapping } from "./mappings/BallMappings.js";

import { Ball } from "./ball/Ball.js";
import { Types as GameTypes, States as GameStates } from "./props/GameProps.js";
import { Types as BallTypes } from "./props/BallProps.js";

class Player {
	constructor(id, type) {
		this.id = id;
		this.type = type;
		this.points = 0;
	}
}

export class Game {
	constructor(scene, camera, renderer) {
		/**
		 * scene - contains all scene nodes
		 * gameType - sets either singleplayer or multiplayer
		 *
		 * player - gets set if gameType == singleplayer else null
		 * players - gets set if gameType == multiplayer
		 * currentPlayer - needed for switching between player turns
		 * pocketedBalls - contains balls that were pocketed so players gets set and to track gamestate
		 * gameState - tracks state of the game
		 *
		 *
		 */
		this.scene = scene;
		this.camera = camera;
		this.renderer = renderer;

		this.init();
	}

	/**
	 * Game rules:
	 * #1 - Flip a coin and start if multiplayer, else just start
	 * #2 - Breaking the balls - sets the type for players
	 * #3 - In progress:
	 * 		+ If the first ball hit with white is of player's type and the correct type ball(s) go inside the hole -> points point and player continues
	 * 		+ If the first ball hit isn't the player's type -> points for the player of the type that (if it) goes in and switch players
	 * 		+ If the white goes in -> place the ball anywhere on the line
	 * #4 - Endgame:
	 * 		+ When only black is left and final hole is true -> if black goes inside the correct player wins, else continue
	 */

	async init() {
		this.nodes = [];
		this.scene.traverse((node) => this.nodes.push(node));

		this.gameState = GameStates.LOADING;
		this.gameType = null;

		this.player = null;
		this.players = null;
		this.currentPlayer = -1;

		this.extractBalls();
		this.pocketedBalls = [];

		this.extractTable();
		this.extractCue();
	}

	extractBalls() {
		this.balls = this.nodes
			.slice(18, 34)
			.map((node, i) => new Ball(i, node));
	}

	extractTable() {
		this.table = this.nodes.slice();
	}

	extractCue() {
		this.cue = this.nodes.slice();
	}

	coinFlip() {
		this.currentPlayer = Math.random() > 0.5 ? 0 : 1;
	}

	break() {
		if (this.pocketedBalls.any()) {
			this.players.push(new Player(0, BallTypes.SOLID));
			this.players.push(new Player(1, BallTypes.STRIPES));
			this.gameState = GameStates.IN_PROGRESS;
		} else {
			this.gameState = GameStates.PLAYER_NOT_SET;
		}
	}

	setWhite() {}

	switchPlayer() {
		this.currentPlayer = this.currentPlayer == 1 ? 0 : 1;
	}

	start() {
		// if (this.settings.gameType == GameTypes.SINGLEPLAYER) {
		// 	this.player = new Player(0, BallTypes.BOTH);
		// } else {
		// 	this.coinFlip();
		// 	this.break();
		// }
	}

	update(time, dt) {
		this.scene.traverse((node) => {
			for (const component of node.components) {
				component.update?.(time, dt);
			}
		});
	}

	render() {
		this.renderer.render(this.scene, this.camera);
	}
}
