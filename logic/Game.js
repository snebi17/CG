import { ballMappings } from "./mappings/BallMappings.js";
import { tableMappings } from "./mappings/TableMappings.js";
import { BallType, GameType, GameState } from "./Types.js";

class Player {
	constructor(id, type) {
		this.id = id;
		this.type = type;
		this.points = 0;
	}
}

export class Game {
	constructor(scene) {
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

		this.gameType = null;
		this.gameState = GameState.LOADING;

		/**
		 *
		 */
		this.player = null;
		this.players = null;
		this.currentPlayer = -1;

		this.activeBalls = [];
		this.pocketedBalls = [];

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

	init() {
		this.balls = this.scene;
		this.gameState = GameState.LOADING;
	}

	coinFlip() {
		this.currentPlayer = Math.random() > 0.5 ? 0 : 1;
	}

	break() {
		if (this.pocketedBalls.any()) {
			this.players.push(new Player(0, BallType.SOLID));
			this.players.push(new Player(1, BallType.STRIPES));
			this.gameState = GameState.IN_PROGRESS;
		} else {
			this.gameState = GameState.PLAYER_NOT_SET;
		}
	}

	setWhite() {}

	switchPlayer() {
		this.currentPlayer = this.currentPlayer == 1 ? 0 : 1;
	}

	update() {}

	start() {
		if (this.settings.gameType == GameType.SINGLEPLAYER) {
			this.player = new Player(0, BallType.BOTH);
		} else {
			this.coinFlip();
			this.break();
		}
	}
}
