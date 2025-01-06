import { Transform } from "../engine/core.js";

import { Ball } from "./components/Ball.js";
import { Table } from "./components/Table.js";
import { Edge } from "./components/Edge.js";
import { Cue } from "./Cue.js";
import { Pocket } from "./components/Pocket.js";
import { Component } from "./components/Component.js";

import { FirstPersonController } from "../engine/controllers/FirstPersonController.js";

import { BallType, GameState } from "./common/Enums.js";
import { vec3 } from "../lib/glm.js";

class Player {
	constructor(id, type) {
		this.id = id;
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
			gameState = GameState.HITTING,
			gameType = null,
			player = null,
			players = null,
			currentPlayer = -1,
			pocketedBalls = [],
			movingBalls = [],
			keys = {},
		} = {}
	) {
		this.scene = scene;
		this.camera = camera;
		this.renderer = renderer;
		this.domElement = domElement;

		// gameState - used for state management
		// gameType - used for initialization of player/players depending on mode of user choice
		this.gameState = gameState;
		this.gameType = gameType;

		// player - player object if singleplayer
		// players - array of players if multiplayer
		// currentPlayer - used for switching players on each turn
		this.player = player;
		this.players = players;
		this.currentPlayer = currentPlayer;

		this.pocketedBalls = pocketedBalls;

		this.keys = keys;

		this.setComponents();

		this.camera.addComponent(
			new FirstPersonController(this.camera, this.domElement)
		);

		this.table = new Table(this.balls, this.edges, this.pockets);

		// const transform = this.camera.getComponentOfType(Transform);
		// transform.matrix = this.white.node.getComponentOfType(Transform).matrix;
		// transform.translation = this.white.center;
		// transform.translation[1]++;

		this.initHandlers();
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

	initHandlers() {
		this.keydownHandler = this.keydownHandler.bind(this);
		this.keyupHandler = this.keyupHandler.bind(this);

		const element = this.domElement;
		const doc = element.ownerDocument;

		doc.addEventListener("keydown", this.keydownHandler);
		doc.addEventListener("keyup", this.keyupHandler);
	}

	setComponents() {
		this.cue = new Cue(this.camera, this.scene.children.at(0), 0);

		this.balls = this.scene.children
			.slice(20, 36)
			.map((node, i) => new Ball(i, node));

		this.white = this.balls.at(0);

		this.pockets = this.scene.children
			.slice(7, 14)
			.map((node, i) => new Pocket(i, node));

		this.edges = this.scene.children
			.slice(13, 19)
			.map((node, i) => new Edge(i, node));

		// this.edges.find((edge) => {
		// 	if (edge.id == 4) {
		// 		this.scene.removeChild(edge.node);
		// 	}
		// });
	}

	keydownHandler(e) {
		this.keys[e.code] = true;
	}

	keyupHandler(e) {
		this.keys[e.code] = false;
	}

	start() {
		this.coinFlip();
		this.gameState = GameState.STARTED;
	}

	update(time, dt) {
		if (this.gameState == GameState.STARTED) {
			this.break();
		}

		if (this.gameState == GameState.RESOLVING_COLLISION) {
			this.resolveCollision(time, dt);
		}

		if (this.gameState == GameState.BALL_IN_HAND) {
			this.setCueBall();
		}

		if (this.gameState == GameState.IN_PROGRESS) {
			if (this.keys["Space"]) {
				console.log("Space");
				this.white.hit();
				this.gameState = GameState.RESOLVING_COLLISION;
			}
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

	break() {
		if (this.keys["Space"]) {
			this.white.hit();
			this.gameState = GameState.RESOLVING_COLLISION;
		}
	}

	setCueBall() {}

	switchPlayer() {
		this.currentPlayer = this.currentPlayer == 1 ? 0 : 1;
	}

	checkForFaults() {
		const pocketedBalls = this.table.pocketedBalls.filter(
			(ball) => ball.type != this.currentPlayer.type
		);
		if (pocketedBalls.length == 0) {
		}
		// const faulPockets = this.pocketedBalls.filter(
		// 	(ball) => ball.type !== this.currentPlayer.type
		// );

		// if (faulPockets.length == 0) {
		// 	this.switchPlayer();
		// }

		this.gameState = GameState.IN_PROGRESS;
	}

	resolveCollision(time, dt) {
		this.table.update(time, dt);

		this.pocketedBalls = this.balls.filter((ball) => ball.isPocketed);

		this.movingBalls = this.balls.filter((ball) => ball.isMoving);
		if (this.movingBalls.length == 0) {
			this.checkForFaults();
		}
	}
}
