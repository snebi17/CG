/**
 * These objects ared used to map node IDs to actual objects for easier referencing further in code.
 */

import { Colors, Types } from "../props/BallProps.js";

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

const IdBallMapping = {
	0: {
		color: Colors.WHITE,
		type: Types.NONE,
	},
	1: {
		color: Colors.YELLOW,
		type: Types.SOLID,
	},
	2: {
		color: Colors.BROWN,
		type: Types.SOLID,
	},
	3: {
		color: Colors.ORANGE,
		type: Types.STRIPES,
	},
	4: {
		color: Colors.GREEN,
		type: Types.STRIPES,
	},
	5: {
		color: Colors.BLACK,
		type: Types.NONE,
	},
	6: {
		color: Colors.BLUE,
		type: Types.SOLID,
	},
	7: {
		color: Colors.GREEN,
		type: Types.SOLID,
	},
	8: {
		color: Colors.YELLOW,
		type: Types.STRIPES,
	},
	9: {
		color: Colors.PURPLE,
		type: Types.SOLID,
	},
	10: {
		color: Colors.BROWN,
		type: Types.STRIPES,
	},
	11: {
		color: Colors.BLUE,
		type: Types.STRIPES,
	},
	12: {
		color: Colors.ORANGE,
		type: Types.SOLID,
	},
	13: {
		color: Colors.PURPLE,
		type: Types.STRIPES,
	},
	14: {
		color: Colors.RED,
		type: Types.SOLID,
	},
	15: {
		color: Colors.RED,
		type: Types.STRIPES,
	},
};

export { IdBallMapping };
