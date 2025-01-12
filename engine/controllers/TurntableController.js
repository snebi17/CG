import { quat, vec3 } from 'glm';
import { Transform } from '../core/Transform.js';

export class TurntableController {

    constructor(node, domElement, {
        pitch = 0,
        yaw = 0,
        distance = 1,
        moveSensitivity = 0.004,
        zoomSensitivity = 0.002,
        /****** NEW ******/
        // Add a pivot (the position of the white ball) as a parameter or default
        pivot = [0, 0, 0],
    } = {}) {
        this.node = node;
        this.domElement = domElement;

        this.pitch = pitch;
        this.yaw = yaw;
        this.distance = distance;

        this.moveSensitivity = moveSensitivity;
        this.zoomSensitivity = zoomSensitivity;

        /****** NEW ******/
        // Store the pivot in the controller so we know around which point to orbit
        this.pivot = pivot;

        this.initHandlers();
    }

    initHandlers() {
        this.pointerdownHandler = this.pointerdownHandler.bind(this);
        this.pointerupHandler = this.pointerupHandler.bind(this);
        this.pointermoveHandler = this.pointermoveHandler.bind(this);
        this.wheelHandler = this.wheelHandler.bind(this);

        this.domElement.addEventListener('pointerdown', this.pointerdownHandler);
        this.domElement.addEventListener('wheel', this.wheelHandler);
    }

    pointerdownHandler(e) {
        this.domElement.setPointerCapture(e.pointerId);
        this.domElement.requestPointerLock();
        this.domElement.removeEventListener('pointerdown', this.pointerdownHandler);
        this.domElement.addEventListener('pointerup', this.pointerupHandler);
        this.domElement.addEventListener('pointermove', this.pointermoveHandler);
    }

    pointerupHandler(e) {
        this.domElement.releasePointerCapture(e.pointerId);
        this.domElement.ownerDocument.exitPointerLock();
        this.domElement.addEventListener('pointerdown', this.pointerdownHandler);
        this.domElement.removeEventListener('pointerup', this.pointerupHandler);
        this.domElement.removeEventListener('pointermove', this.pointermoveHandler);
    }

    pointermoveHandler(e) {
        const dx = e.movementX;
        const dy = e.movementY;

        this.pitch -= dy * this.moveSensitivity;
        this.yaw   -= dx * this.moveSensitivity;

        const twopi = Math.PI * 2;
        const halfpi = Math.PI / 2;

        this.pitch = Math.min(Math.max(this.pitch, -halfpi), halfpi);
        this.yaw = ((this.yaw % twopi) + twopi) % twopi;
    }

    wheelHandler(e) {
        this.distance *= Math.exp(this.zoomSensitivity * e.deltaY);
    }

    update() {
        const transform = this.node.getComponentOfType(Transform);
        if (!transform) {
            return;
        }

        // Create a quaternion rotation from yaw/pitch
        const rotation = quat.create();
        quat.rotateY(rotation, rotation, this.yaw);
        quat.rotateX(rotation, rotation, this.pitch);

        // Assign this rotation to the camera/node transform
        transform.rotation = rotation;

        // Create a vector pointing 'distance' units away along the camera's local Z
        let translation = [0, 0, this.distance];

        // Apply the pitch & yaw to that offset so it properly orbits around the pivot
        vec3.rotateX(translation, translation, [0, 0, 0], this.pitch);
        vec3.rotateY(translation, translation, [0, 0, 0], this.yaw);

        /****** NEW or CHANGED ******/
        // Instead of using [0, 0, 0] as the orbit center, we add the pivot's position 
        // so the camera will orbit around the white ball (or whichever pivot you define).
        vec3.add(translation, this.pivot, translation);

        // Final position of the camera/node
        transform.translation = translation;
    }

}
