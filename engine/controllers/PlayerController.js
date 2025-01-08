import { quat, vec3, mat4 } from "glm";

import { Transform } from "../core/Transform.js";
import { getGlobalModelMatrix, getLocalModelMatrix, getGlobalViewMatrix, getLocalViewMatrix } from "../core/SceneUtils.js";

export class PlayerController {
    constructor(
        camera,
        domElement,
        ball,
        {
            pitch = -Math.PI / 30,
            yaw = Math.PI / 2,
            pointerSensitivity = 0.0015,
            center = vec3.fromValues(0, 0, 0)
        } = {}
    ) {
        this.camera = camera;
        this.domElement = domElement;
        this.ball = ball;

        this.camera.getComponentOfType(Transform).translation = [1.5, 1.5, 0];

        this.currentPosition = null;

        this.keys = {};

        this.pitch = pitch;
        this.yaw = yaw;
        this.pointerSensitivity = pointerSensitivity;
        this.moveSpeed = .5;
        this.radius =.1;
        this.center = center;

        this.initHandlers();
    }

    initHandlers() {
        this.pointermoveHandler = this.pointermoveHandler.bind(this);
        this.keydownHandler = this.keydownHandler.bind(this);
        this.keyupHandler = this.keyupHandler.bind(this);

        const element = this.domElement;
        const doc = element.ownerDocument;

        doc.addEventListener("keydown", this.keydownHandler);
        doc.addEventListener("keyup", this.keyupHandler);

        element.addEventListener("click", (e) => element.requestPointerLock());
        doc.addEventListener("pointerlockchange", (e) => {
            if (doc.pointerLockElement === element) {
                doc.addEventListener("pointermove", this.pointermoveHandler);
            } else {
                doc.removeEventListener("pointermove", this.pointermoveHandler);
            }
        });
    }

    update(t, dt) {
        if (this.keys["KeyA"]) {
            this.yaw += this.moveSpeed * dt;
        }
        if (this.keys["KeyD"]) {
            this.yaw -= this.moveSpeed * dt;
        }

        this.updatePosition();
        this.updateRotation();        
    }

    updatePosition() {
        const matrix = this.ball ? getGlobalModelMatrix(this.ball) : mat4.create();
        this.center = vec3.fromValues(matrix[4], matrix[8], matrix[12]);

        const x = this.center[0] + this.radius * Math.cos(this.yaw);
        const z = this.center[1] + this.radius * Math.sin(this.yaw);
        const y = this.center[2] + 1;

        const position = vec3.fromValues(x, y, z);

        this.updateCameraPosition(position);

        const transform = this.camera.getComponentOfType(Transform);

        if (transform) {
            const matrix = transform.matrix;
            mat4.fromRotationTranslationScale(matrix, quat.create(), position, vec3.fromValues(1, 1, 1));
            transform.matrix = matrix;
        }
    }

    updateCameraPosition(playerPosition) {
        // The camera should follow the player, so it will be at the calculated position (same as the player)
        // but it should always look at the ball's position.

        const cameraTransform = this.camera.getComponentOfType(Transform);
        if (cameraTransform) {
            // Calculate direction from the player to the center of the node
            const lookAtDirection = vec3.create();
            vec3.subtract(lookAtDirection, this.center, playerPosition); // Look at the center of the node (ball)

            // Normalize the lookAt direction
            vec3.normalize(lookAtDirection, lookAtDirection);

            // Calculate the camera's position based on the player's position and the lookAt direction
            const cameraPosition = vec3.create();
            vec3.add(cameraPosition, playerPosition, vec3.scale(vec3.create(), lookAtDirection, -this.radius));

            // Set the camera position
            cameraTransform.translation = cameraPosition;

            // Update camera's orientation to look at the ball
            const cameraRotation = quat.create();
            quat.rotationTo(cameraRotation, vec3.fromValues(0, 0, 1), lookAtDirection); // Point the camera to the ball
            cameraTransform.rotation = cameraRotation;
        }
    }

    updateRotation() {
        const transform = this.camera.getComponentOfType(Transform);
        
        if (transform) {
            const rotation = quat.create();
            quat.rotateY(rotation, rotation, this.yaw);
            quat.rotateX(rotation, rotation, this.pitch);
            transform.rotation = rotation;
        }
    }

    pointermoveHandler(e) {
        const dx = e.movementX;
        const dy = e.movementY;

        this.pitch -= dy * this.pointerSensitivity;
        this.yaw -= dx * this.pointerSensitivity;

        const twopi = Math.PI * 2;
        const halfpi = Math.PI / 2;

        this.pitch = Math.min(Math.max(this.pitch, -halfpi), halfpi);
        this.yaw = ((this.yaw % twopi) + twopi) % twopi;
    }

    keydownHandler(e) {
        this.keys[e.code] = true;
    }

    keyupHandler(e) {
        this.keys[e.code] = false;
    }
}
