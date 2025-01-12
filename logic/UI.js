import { GameState } from "./common/Enums.js";

export class UI{
    constructor(players, gameState) {
        this.players = players;
        this.gameState = gameState;
        this.ui = document.getElementById('ui');
    }

    showMain() {
        const start = true;
        if (start) {
            this.gameState = GameState.STARTED;
        }
    }

    showInGame() {

    }

    update() {
        
    }
}