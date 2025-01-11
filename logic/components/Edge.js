import { vec3 } from "../../lib/glm.js";

import { EdgeMapping, EdgeNormalMapping } from "../common/Mappings.js";
import { Component } from "./Component.js";

export class Edge extends Component {
	constructor(id, node) {
		super(id, node);

		this.position = EdgeMapping[this.id];
		this.normal = EdgeNormalMapping[this.position];
	}
}
