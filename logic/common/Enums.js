const BallType = {
	NONE: "none",
	CUE: "cue",
	EIGHT: "eight",
	SOLID: "solid",
	STRIPES: "stripes",
};

const BallColor = {
	ORANGE: "orange",
	GREEN: "green",
	YELLOW: "yellow",
	BROWN: "brown",
	BLUE: "blue",
	PURPLE: "purple",
	RED: "red",
	WHITE: "white",
	BLACK: "black",
};

const GameType = {
	NONE: "none",
	SINGLEPLAYER: "singleplayer",
	MULTIPLAYER: "multiplayer",
};

const GameState = {
	NONE: "none",
	LOADING: "loading",
	PLAYER_NOT_SET: "player not set",
	IN_PROGRESS: "in progress",
	FINISHED: "finished",
	BALL_IN_HAND: "ball in hand",
};

const PocketLocation = {
	NONE: "none",
	UPPER_LEFT: "upper left",
	UPPER_RIGHT: "upper right",
	MIDDLE_LEFT: "middle left",
	MIDDLE_RIGHT: "middle right",
	LOWER_LEFT: "lower left",
	LOWER_RIGHT: "lower right",
};

const ShotResult = {
	NONE: "none",
	LEGAL: "legal",
	POCKETED: "pocketed",
	FOULED: "fouled", 
};

export { BallColor, BallType, GameType, GameState, PocketLocation, ShotResult };
