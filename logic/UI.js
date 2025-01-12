export class UI {
    constructor(players, gameState) {
        this.players = players;
        this.gameState = gameState;

        this.playerOne = document.getElementById("player-one");
        this.playerTwo = document.getElementById("player-two");

        this.display();
    }

    showWinner(winner) {

    }

    display() {
        const { playerOne, playerTwo } = this.getPlayerInfos();

        this.playerOne.innerText = `${playerOne.name} (${playerOne.type}): ${playerOne.points}`;
        this.playerTwo.innerText = `${playerTwo.name} (${playerTwo.type}): ${playerTwo.points}`;
    }

    getPlayerInfos() {
        let playerOneName = this.players[0].name;
        let playerOneType = this.players[0].type == null ? "N/A" : this.players[0].type;
        let playerOnePoints = this.players[0].points;

        let playerTwoName = this.players[1].name;
        let playerTwoType = this.players[1].type == null ? "N/A" : this.players[1].type;
        let playerTwoPoints = this.players[1].points;

        return {
            playerOne: {
                name: playerOneName,
                type: playerOneType,
                points: playerOnePoints
            },
            playerTwo: {
                name: playerTwoName,
                type: playerTwoType,
                points: playerTwoPoints
            }
        }
    }
}