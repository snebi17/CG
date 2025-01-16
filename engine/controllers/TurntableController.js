import { quat, vec3 } from 'glm';
import { Transform } from '../core/Transform.js';

export class TurntableController {

    constructor(node, domElement, {
        pitch = 0,
        yaw = 0,
        distance = 1,
        moveSensitivity = 0.004,
        zoomSensitivity = 0.002,
        pivot = [0, 0, 0],
        birdsEyeDistance = 6,
    } = {}) {
        this.node = node;
        this.domElement = domElement;

        this.pitch = pitch;  
        this.yaw   = yaw;    
        this.distance = distance;

        this.moveSensitivity = moveSensitivity;
        this.zoomSensitivity = zoomSensitivity;

        this.pivot = pivot;

        this.birdsEyeDistance = birdsEyeDistance;
        this.isBirdsEye = false;

        this.originalPitch = pitch;
        this.originalYaw   = yaw;
        this.originalDistance = distance;

		this.maxDistance =3;
		this.maxBirdsEyeDistance = 10;

        this.initHandlers();
    }

    initHandlers() {
        this.pointerdownHandler = this.pointerdownHandler.bind(this);
        this.pointerupHandler   = this.pointerupHandler.bind(this);
        this.pointermoveHandler = this.pointermoveHandler.bind(this);
        this.wheelHandler       = this.wheelHandler.bind(this);

        this.domElement.addEventListener('pointerdown', this.pointerdownHandler);
        this.domElement.addEventListener('wheel', this.wheelHandler);
    }

    toggleBirdsEye() {
        if (!this.isBirdsEye) {
            this.originalPitch = this.pitch;
            this.originalYaw   = this.yaw;
            this.originalDistance = this.distance;

            this.pitch = -Math.PI / 2;
            this.yaw   = 0;
            this.distance = this.birdsEyeDistance;

            this.isBirdsEye = true;
        } else {
            this.pitch = this.originalPitch;
            this.yaw   = this.originalYaw;
            this.distance = this.originalDistance;

            this.isBirdsEye = false;
        }
    }

    pointerdownHandler(e) {
        this.domElement.setPointerCapture(e.pointerId);
        this.domElement.requestPointerLock();
        this.domElement.removeEventListener('pointerdown', this.pointerdownHandler);
        this.domElement.addEventListener('pointerup',   this.pointerupHandler);
        this.domElement.addEventListener('pointermove', this.pointermoveHandler);
    }

    pointerupHandler(e) {
        this.domElement.releasePointerCapture(e.pointerId);
        this.domElement.ownerDocument.exitPointerLock();
        this.domElement.addEventListener('pointerdown', this.pointerdownHandler);
        this.domElement.removeEventListener('pointerup',   this.pointerupHandler);
        this.domElement.removeEventListener('pointermove', this.pointermoveHandler);
    }

    pointermoveHandler(e) {
        if (this.isBirdsEye) {
            return;
        }

        const dx = e.movementX;
        const dy = e.movementY;

        this.pitch -= dy * this.moveSensitivity;
        this.yaw   -= dx * this.moveSensitivity;

        const twopi  = Math.PI * 2;
        const halfpi = Math.PI / 2;

        const minPitchDeg = -40;
        const maxPitchDeg = -10;
        const deg2Rad = Math.PI / 180;

        const minPitch = minPitchDeg * deg2Rad;
        const maxPitch = maxPitchDeg * deg2Rad;

        this.pitch = Math.min(Math.max(this.pitch, minPitch), maxPitch);

        this.pitch = Math.min(Math.max(this.pitch, -halfpi), halfpi);
        this.yaw = ((this.yaw % twopi) + twopi) % twopi;
    }

    wheelHandler(e) {
        this.distance *= Math.exp(this.zoomSensitivity * e.deltaY);

		if (this.isBirdsEye && this.distance > this.maxBirdsEyeDistance) {
			this.distance = this.maxBirdsEyeDistance;
		}
		if (!this.isBirdsEye && this.distance > this.maxDistance) {
			this.distance = this.maxDistance;
		}
    }

    update(dt) {
        const transform = this.node.getComponentOfType(Transform);
        if (!transform) {
            return;
        }

        if (this.isBirdsEye) {
            const rotation = quat.create();
            quat.rotateX(rotation, rotation, this.pitch);
            transform.rotation = rotation;

            transform.translation = [0, this.distance, 0];
        } 
        else {
            const rotation = quat.create();
            quat.rotateY(rotation, rotation, this.yaw);
            quat.rotateX(rotation, rotation, this.pitch);
            transform.rotation = rotation;

            let translation = [0, 0, this.distance];
            vec3.rotateX(translation, translation, [0, 0, 0], this.pitch);
            vec3.rotateY(translation, translation, [0, 0, 0], this.yaw);

            vec3.add(translation, this.pivot, translation);
            transform.translation = translation;
        }
    }
    
    getViewVector() {
        const forward = vec3.fromValues(
            Math.cos(this.pitch) * Math.sin(this.yaw),
            0,
            Math.cos(this.pitch) * Math.cos(this.yaw)
        );

        return forward.negate();
    }
}
