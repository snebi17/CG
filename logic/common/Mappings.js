/**
 * These objects are used to map node IDs to actual objects for easier referencing further in code.
 * Indicess 20 to 35 inclusive in .gltf represent nodes for balls.
 */

import { BallColor, BallType, PocketLocation, EdgeLocation } from "./Enums.js";

/**
 * Stripes:
	+ 3: Orange,
	+ 4: Green,
	+ 8: Yellow,
	+ 10: Brown,
	+ 11: Blue,
	+ 13: Purple,
	+ 15: Red

   Solid:
	+ 1: Yellow,
	+ 2: Brown,
	+ 6: Blue,
	+ 7: Green,
	+ 9: Purple,
	+ 12: Orange,
	+ 14: Red,
 */

const BallMapping = {
	0: {
		color: BallColor.WHITE,
		type: BallType.CUE,
	},
	1: {
		color: BallColor.YELLOW,
		type: BallType.SOLID,
	},
	2: {
		color: BallColor.BROWN,
		type: BallType.SOLID,
	},
	3: {
		color: BallColor.ORANGE,
		type: BallType.STRIPES,
	},
	4: {
		color: BallColor.GREEN,
		type: BallType.STRIPES,
	},
	5: {
		color: BallColor.BLACK,
		type: BallType.EIGHT,
	},
	6: {
		color: BallColor.BLUE,
		type: BallType.SOLID,
	},
	7: {
		color: BallColor.GREEN,
		type: BallType.SOLID,
	},
	8: {
		color: BallColor.YELLOW,
		type: BallType.STRIPES,
	},
	9: {
		color: BallColor.PURPLE,
		type: BallType.SOLID,
	},
	10: {
		color: BallColor.BROWN,
		type: BallType.STRIPES,
	},
	11: {
		color: BallColor.BLUE,
		type: BallType.STRIPES,
	},
	12: {
		color: BallColor.ORANGE,
		type: BallType.SOLID,
	},
	13: {
		color: BallColor.PURPLE,
		type: BallType.STRIPES,
	},
	14: {
		color: BallColor.RED,
		type: BallType.SOLID,
	},
	15: {
		color: BallColor.RED,
		type: BallType.STRIPES,
	},
};

const PocketMapping = {
	0: PocketLocation.LOWER_RIGHT,
	1: PocketLocation.LOWER_LEFT,
	2: PocketLocation.MIDDLE_LEFT,
	3: PocketLocation.UPPER_LEFT,
	4: PocketLocation.UPPER_RIGHT,
	5: PocketLocation.MIDDLE_RIGHT,
};

const EdgeMapping = {
	0: EdgeLocation.RIGHT_LOWER,
	1: EdgeLocation.LEFT_LOWER,
	2: EdgeLocation.RIGHT_UPPER,
	3: EdgeLocation.LEFT_UPPER,
	4: EdgeLocation.LOWER,
	5: EdgeLocation.UPPER,
};

const EdgeNormalMapping = {
	left: [0, 0, -1],
	right: [0, 0, 1],
	upper: [1, 0, 0],
	lower: [-1, 0, 0],
};

export { BallMapping, PocketMapping, EdgeMapping, EdgeNormalMapping };
