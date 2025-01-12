import { Camera, Transform } from "../engine/core.js";

import { Ball } from "./components/Ball.js";
import { Table } from "./components/Table.js";
import { Edge } from "./components/Edge.js";
import { Cue } from "./components/Cue.js";
import { Pocket } from "./components/Pocket.js";
import { TurntableController } from "../engine/controllers/TurntableController.js";
import { UI } from "./UI.js";

import { GameState, BallType } from "./common/Enums.js";
import { vec3 } from "../lib/glm.js";

class Player {
	constructor(id, type, name) {
		this.id = id;
		this.name = name;
		this.type = type;
		this.points = 0;
	}
}

export class Game {
	/**
	 * @param {Node} scene the scene containing child nodes
	 * @param {Camera} camera camera used to track the cue ball
	 * @param {UnlitRenderer} renderer renders the updated scene
	 * @param {HTMLElement} domElement DOM element that gets passed into input controller
	 * @param {*} args arguments for tracking key objects in the game
	 */
	constructor(
		scene,
		camera,
		renderer,
		domElement,
		{
			gameState = GameState.STARTED,
			gameType = null,
			players = [new Player(0, null, ""), new Player(1, null, "")],
			currentPlayer = -1,
			winner = null,
			keys = {},
		} = {}
	) {
		this.scene = scene;
		this.camera = camera;
		this.renderer = renderer;
		this.domElement = domElement;

		const turntableController = new TurntableController(this.camera, this.domElement);
		this.camera.addComponent(turntableController);		
		this.controller = this.camera.getComponentOfType(TurntableController);

		// gameState - used for state management
		// gameType - used for initialization of player/players depending on mode of user choice
		this.gameState = gameState;
		this.gameType = gameType;

		// players - array of players if multiplayer
		// currentPlayer - used for switching players on each turn
		this.players = players;
		this.currentPlayer = currentPlayer;
		this.winner = winner;
		this.keys = keys;
		this.initComponents();

		this.table = new Table(this.balls, this.edges, this.pockets);
		
		this.UI = new UI(this.players, this.gameState);
		this.initHandlers();
	}

	initHandlers() {
		this.keydownHandler = this.keydownHandler.bind(this);
		this.keyupHandler = this.keyupHandler.bind(this);

		const element = this.domElement;
		const doc = element.ownerDocument;

		doc.addEventListener("keydown", this.keydownHandler);
		doc.addEventListener("keyup", this.keyupHandler);
	}

	initComponents() {
		this.cue = new Cue(this.camera, this.scene.children.at(0), 0);

		this.camera.addComponent(this.cue);
		this.balls = this.scene.children
			.slice(20, 36)
			.map((node, i) => new Ball(i, node));

		this.white = this.balls.at(0);

		this.pockets = this.scene.children
			.slice(7, 13)
			.map((node, i) => new Pocket(i, node));

		this.edges = this.scene.children
			.slice(13, 19)
			.map((node, i) => new Edge(i, node));
	}

	keydownHandler(e) {
		this.keys[e.code] = true;
	}

	keyupHandler(e) {
		this.keys[e.code] = false;
	}

	start() {
		this.coinFlip();
		this.setCamera();
	}

	setCamera() {
		const translation =
			this.white.node.getComponentOfType(Transform).translation;
		const whitePos = translation;
		this.controller.pivot = whitePos;
		this.controller.yaw += Math.PI / 2;
		this.controller.pitch -= Math.PI / 18;
	}

	update(time, dt) {
		if (this.gameState == GameState.LOADING) {
			this.UI.showMain();
			return;
		}

		this.UI.showInGame();

		if (this.gameState == GameState.STARTED) {
			if (this.keys["Space"]) {
				this.hit();
			}
		}

		if (this.gameState == GameState.RESOLVING_COLLISION) {
			this.table.update(time, dt);
			
			if (this.table.isStationary) {
				this.controller.toggleBirdsEye();
				this.checkForFaults();
			}
		}

		if (this.gameState == GameState.BALL_IN_HAND) {
			this.setCueBall();
			this.setCamera();
		}

		if (this.gameState == GameState.IN_PROGRESS) {
			if (this.keys["Space"]) {
				this.hit();
			}
		}

		if (this.gameState == GameState.FINISHED) {
			alert(`Winner is: ${this.winner}`);
		}

		this.scene.traverse((node) => {
			for (const component of node.components) {
				component.update?.(time, dt);
			}
		});
	}

	render() {
		this.renderer.render(this.scene, this.camera);
	}

	coinFlip() {
		this.currentPlayer = Math.random() > 0.5 ? 0 : 1;
	}

	hit() {
		const velocity = this.controller.getViewVector();
		vec3.scale(velocity, velocity, 2);
		this.white.hit(velocity);
		this.gameState = GameState.RESOLVING_COLLISION;
		this.controller.toggleBirdsEye();
	}

	setCueBall() {
		this.white.isPocketed = false;
		this.white.set();
		this.gameState = GameState.IN_PROGRESS;
	}

	switchPlayer() {
		console.log("Switching players");
		this.currentPlayer = this.currentPlayer == 1 ? 0 : 1;
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
	 * 		+ When only black is left -> if black goes inside the correct player wins, else continue
	 */
	checkForFaults() {
		const status = this.table.getStatus();

		if (status.pocketedBalls.length == 0) {
			this.switchPlayer();
			this.gameState = GameState.IN_PROGRESS;
			this.table.reset();
			return;
		}

		const playerOne = this.players[this.currentPlayer];
		const playerTwo = this.players[this.currentPlayer == 1 ? 0 : 1];
		const playersNotSet = playerOne.type == null && playerTwo.type == null;

		if (playersNotSet) {
			const type = status.pocketedBalls[0].type;

			if (type == BallType.SOLID) {
				playerOne.type = BallType.SOLID;
				playerTwo.type = BallType.STRIPES;
			} else {
				playerOne.type = BallType.STRIPES;
				playerTwo.type = BallType.SOLID;
			}

			if (this.checkEight(status.pocketedBalls)) {
				if (playerOne.score == 7) {
					this.winner = playerOne;
					console.log("Winner" + this.winner);
				} else {
					this.winner = playerTwo;
					console.log("Winner" + this.winner);
				}
				this.gameState = GameState.FINISHED;
				return;
			}

			if (this.checkWhite(status.pocketedBalls)) {
				this.updatePoints(status.pocketedBalls);
				this.switchPlayer();
				this.gameState = GameState.BALL_IN_HAND;
				this.table.reset();
				return;
			}
		} else {
			if (this.checkEight(status.pocketedBalls)) {
				if (playerOne.score == 7) {
					this.winner = playerOne;
					console.log("Winner" + this.winner);
				} else {
					this.winner = playerTwo;
					console.log("Winner" + this.winner);
				}
				this.gameState = GameState.FINISHED;
				return;
			}

			if (this.checkWhite(status.pocketedBalls)) {
				this.updatePoints(status.pocketedBalls);
				this.switchPlayer();
				this.gameState = GameState.BALL_IN_HAND;
				this.table.reset();
				return;
			}

			if (
				!this.checkType(status.firstHit) &&
				this.gameState != GameState.STARTED
			) {
				this.updatePoints(status.pocketedBalls);
				this.switchPlayer();
				this.gameState = GameState.BALL_IN_HAND;
				this.table.reset();
				return;
			}
		}
		this.updatePoints(status.pocketedBalls);
		this.gameState = GameState.IN_PROGRESS;
		this.table.reset();
	}

	checkEight(balls) {
		for (const ball of balls) {
			if (ball.type == BallType.EIGHT) {
				return true;
			}
		}
		return false;
	}

	checkWhite(balls) {
		for (const ball of balls) {
			if (ball.type == BallType.CUE) {
				return true;
			}
		}
		return false;
	}

	checkType(ball) {
		return this.players[this.currentPlayer].type == ball.type;
	}

	getBallsOfType(balls, type) {
		return balls.filter((ball) => ball.type == type);
	}

	updatePoints(balls) {
		for (let player of this.players) {
			const n = balls.filter((ball) => ball.type == player.type).length;
			player.points += n;
		}
		this.UI.update();
		this.clearPocketed(balls);
	}

	clearPocketed(balls) {
		for (const ball of balls) {
			if (ball.type != BallType.CUE) {
				this.scene.removeChild(ball.node);
			}
		}
	}
}
