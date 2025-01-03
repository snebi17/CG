import { Transform } from "../engine/core.js";

import { Ball } from "./components/Ball.js";
import { Table } from "./components/Table.js";
import { Edge } from "./components/Edge.js";
import { Cue } from "./Cue.js";
import { Pocket } from "./components/Pocket.js";
import { Component } from "./components/Component.js";

import { FirstPersonController } from "../engine/controllers/FirstPersonController.js";

import { BallType, GameState } from "./common/Enums.js";

import { Physics } from "./Physics.js";
import { vec3 } from "../lib/glm.js";

class Player {
	constructor(id, type) {
		this.id = id;
		this.type = type;
		this.points = 0;
	}
}

export class Game {
	constructor(scene, camera, renderer, domElement) {
		/**
		 * scene - contains all scene nodes
		 * camera - self explanatory
		 * renderer - renders the scene to canvas
		 */

		this.scene = scene;
		this.camera = camera;
		this.renderer = renderer;
		this.domElement = domElement;

		this.keys = {};

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
		// gameState - used for state management
		// gameType - used for initialization of player/players depending on mode of user choice
		this.gameState = GameState.HITTING;
		this.gameType = null;

		// player - player object if singleplayer
		// players - array of players if multiplayer
		// currentPlayer - used for switching players on each turn
		this.player = null;
		this.players = null;
		this.currentPlayer = -1;

		this.pocketedBalls = [];

		this.setComponents();

		this.camera.addComponent(
			new FirstPersonController(this.camera, this.domElement)
		);
		this.physics = new Physics();

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

	setComponents() {
		this.cue = new Cue(this.camera, this.scene.children.at(0), 0);
		this.white = new Ball(0, this.scene.children.at(20));

		this.balls = this.scene.children
			.slice(22, 37)
			.map((node, i) => new Ball(i + 1, node));

		this.pockets = this.scene.children
			.slice(8, 14)
			.map((node, i) => new Pocket(i, node));

		this.edges = this.scene.children
			.slice(14, 20)
			.map((node, i) => new Edge(i, node));
	}

	keydownHandler(e) {
		this.keys[e.code] = true;
	}

	keyupHandler(e) {
		this.keys[e.code] = false;
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

	start() {
		// if (this.settings.gameType == GameTypes.SINGLEPLAYER) {
		// 	this.player = new Player(0, BallTypes.BOTH);
		// } else {
		// 	this.coinFlip();
		// 	this.break();
		// }
	}

	update(time, dt) {
		if (this.gameState == GameState.RESOLVING_COLLISION) {
			this.physics.update(time, dt);
			this.camera.switchView();
		}

		if (this.gameState == GameState.BALL_IN_HAND) {
		}

		if (this.gameState == GameState.HITTING) {
			if (this.keys["Space"]) {
				this.white.hit(
					vec3.fromValues(1, 0, 0),
					vec3.fromValues(-1, 0, 0)
				);
				this.gameState = this.gameState.RESOLVING_COLLISION;
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
}
