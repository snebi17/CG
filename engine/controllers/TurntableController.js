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
        // Distance when in bird's-eye (top-down) mode
        birdsEyeDistance = 10,
        // How much to rotate when pressing A or D
        rotateKeySensitivity = 0.005,
    } = {}) {
        // Scene node whose transform we're controlling
        this.node = node;
        // The DOM element (usually a canvas) receiving pointer events
        this.domElement = domElement;

        // Current camera orientation
        this.pitch = pitch;  // rotation around X
        this.yaw   = yaw;    // rotation around Y
        this.distance = distance; // how far the camera is from pivot

        // Pointer/mouse movement sensitivity
        this.moveSensitivity = moveSensitivity;
        // Wheel/zoom sensitivity
        this.zoomSensitivity = zoomSensitivity;

        // Point in space we orbit around (e.g., the white ball)
        this.pivot = pivot;

        // Bird's-eye parameters
        this.birdsEyeDistance = birdsEyeDistance;
        // Track whether we’re currently in bird’s-eye mode
        this.isBirdsEye = false;

        // Original camera orientation/distance for reverting after bird’s-eye
        this.originalPitch = pitch;
        this.originalYaw   = yaw;
        this.originalDistance = distance;

        // Key rotation sensitivity for A/D
        this.rotateKeySensitivity = rotateKeySensitivity;

        this.initHandlers();
    }

    initHandlers() {
        // Bind all event handler methods so `this` is consistent
        this.pointerdownHandler = this.pointerdownHandler.bind(this);
        this.pointerupHandler   = this.pointerupHandler.bind(this);
        this.pointermoveHandler = this.pointermoveHandler.bind(this);
        this.wheelHandler       = this.wheelHandler.bind(this);
        this.keydownHandler     = this.keydownHandler.bind(this);

        // Attach pointer listeners
        this.domElement.addEventListener('pointerdown', this.pointerdownHandler);
        this.domElement.addEventListener('wheel', this.wheelHandler);

        // Attach keyboard listener (listen on document so you don't need focus on the canvas)
        document.addEventListener('keydown', this.keydownHandler);
    }

    // Public method to toggle between normal orbit and a fixed top-down view
    toggleBirdsEye() {
        if (!this.isBirdsEye) {
            // Save current orientation so we can revert later
            this.originalPitch = this.pitch;
            this.originalYaw   = this.yaw;
            this.originalDistance = this.distance;

            // Switch to top-down
            this.pitch = -Math.PI / 2;  // Straight down (may adjust sign depending on your coordinate system)
            this.yaw   = 0;             // Could be any direction you like
            this.distance = this.birdsEyeDistance;

            this.isBirdsEye = true;
        } else {
            // Revert to original orbit
            this.pitch = this.originalPitch;
            this.yaw   = this.originalYaw;
            this.distance = this.originalDistance;

            this.isBirdsEye = false;
        }
    }

    // Handler for A/D key rotation (and any other keys you want)
    keydownHandler(e) {
        // If you're in bird’s-eye mode and don't want to allow rotation, exit early
        if (this.isBirdsEye) {
            return;
        }

        // Pressing 'A' rotates left
        if (e.code == "KeyA") {
            this.yaw -= this.rotateKeySensitivity;
        }
        // Pressing 'D' rotates right
        else if (e.code == "KeyD") {
            this.yaw += this.rotateKeySensitivity;
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
        // If you'd prefer to lock out mouse movement in bird’s-eye, just return:
        if (this.isBirdsEye) {
            return;
        }

        // Movement in pixels
        const dx = e.movementX;
        const dy = e.movementY;

        // Update pitch & yaw
        // this.pitch -= dy * this.moveSensitivity;
        this.yaw   -= dx * this.moveSensitivity;

        // Clamp pitch between -90 & +90 degrees
        const twopi  = Math.PI * 2;
        const halfpi = Math.PI / 2;

        // Convert degrees to radians
        const minPitchDeg = -40;  // degrees
        const maxPitchDeg = -10;  // degrees
        const deg2Rad = Math.PI / 180;

        // Now clamp pitch
        const minPitch = minPitchDeg * deg2Rad; // ~ -0.6981317
        const maxPitch = maxPitchDeg * deg2Rad; // ~ -0.1745329

        this.pitch = Math.min(Math.max(this.pitch, minPitch), maxPitch);

        this.pitch = Math.min(Math.max(this.pitch, -halfpi), halfpi);
        // Keep yaw in [0, 2π)
        this.yaw = ((this.yaw % twopi) + twopi) % twopi;
    }

    wheelHandler(e) {
        // Exponential zoom
        this.distance *= Math.exp(this.zoomSensitivity * e.deltaY);
    }

    update() {
        const transform = this.node.getComponentOfType(Transform);
        if (!transform) {
            return;
        }

        // If in bird’s-eye, place camera at (0, distance, 0) looking straight down
        if (this.isBirdsEye) {
            const rotation = quat.create();
            // pitch is -π/2 => look straight down in many coordinate systems
            quat.rotateX(rotation, rotation, this.pitch);
            transform.rotation = rotation;

            // Set translation above the origin (0,0)
            transform.translation = [0, this.distance, 0];
        } 
        // Otherwise, do normal orbit around pivot
        else {
            const rotation = quat.create();
            quat.rotateY(rotation, rotation, this.yaw);
            quat.rotateX(rotation, rotation, this.pitch);
            transform.rotation = rotation;

            let translation = [0, 0, this.distance];
            vec3.rotateX(translation, translation, [0, 0, 0], this.pitch);
            vec3.rotateY(translation, translation, [0, 0, 0], this.yaw);

            

            // Orbit around pivot
            vec3.add(translation, this.pivot, translation);
            transform.translation = translation;
        }
    }
}
