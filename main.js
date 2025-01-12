import { UpdateSystem } from "./engine/systems/UpdateSystem.js";
import { Renderer } from "../engine/renderers/Renderer.js";
import { ResizeSystem } from "./engine/systems/ResizeSystem.js";
import { GLTFLoader } from "../engine/loaders/GLTFLoader.js";
import { Camera, Light, Node, Transform } from "../engine/core.js";
import { Game } from "./logic/Game.js";


const startButton = document.getElementById("start-button");
const playerOne = document.getElementById("player-one-name");
const playerTwo = document.getElementById("player-two-name");

let playerOneName;
let playerTwoName;
const instructionsButton = document.getElementById("instructions-button");
const closeInstructions = document.getElementById("close-instructions");
const instructions = document.getElementById("instructions");

let gameArea = document.getElementById("game-area");
let userInterface = document.getElementById("user-interface");

gameArea.classList.add("hidden");

startButton.addEventListener("click", () => {
	gameArea.classList.remove("hidden");
	userInterface.classList.add("hidden");

	playerOneName = playerOne.value.length > 0 ? playerOne.value : "Igralec #1";
	playerTwoName = playerTwo.value.length > 0 ? playerTwo.value : "Igralec #2";

	initialize();
});

instructionsButton.addEventListener("click", () => {
	instructions.style.display = 'block';
});

closeInstructions.addEventListener("click", () => {
	instructions.style.display = 'none';
});

async function initialize() {
	const canvas = document.querySelector("canvas");
	const renderer = new Renderer(canvas);
	await renderer.initialize();
	
	const loader = new GLTFLoader();
	await loader.load(
		new URL("../models/table/table2.gltf", import.meta.url)
	);
	
	const scene = loader.loadScene(loader.defaultScene);
	if (!scene) {
		throw new Error("A default scene is required to run this example");
	}
	
	const firstLight = new Node();
	firstLight.addComponent(new Transform({ translation: [0, 3.5, 0] }));
	firstLight.addComponent(new Light({ intensity: 2 }));
	
	scene.addChild(firstLight);
	
	const camera = scene.find((node) => node.getComponentOfType(Camera));
	camera.isDynamic = true;
	
	if (!camera) {
		throw new Error("A camera in the scene is require to run this example");
	}
	
	function resize({ displaySize: { width, height } }) {
		camera.getComponentOfType(Camera).aspect = width / height;
	}
	
	const game = new Game(scene, camera, renderer, canvas, { playerOne: playerOneName, playerTwo: playerTwoName });
	
	new ResizeSystem({ canvas, resize }).start();
	new UpdateSystem(game).start();
}

