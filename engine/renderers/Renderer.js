import { vec3, mat4 } from "glm";

import * as WebGPU from "engine/WebGPU.js";

import { Camera, Model, Light } from "engine/core.js";
import { BaseRenderer } from "engine/renderers/BaseRenderer.js";

import {
	getLocalModelMatrix,
	getGlobalModelMatrix,
	getGlobalViewMatrix,
	getProjectionMatrix,
} from "engine/core/SceneUtils.js";

const vertexBufferLayout = {
	arrayStride: 48,
	attributes: [
		{
			name: "position",
			shaderLocation: 0,
			offset: 0,
			format: "float32x3",
		},
		{
			name: "texcoords",
			shaderLocation: 1,
			offset: 12,
			format: "float32x2",
		},
		{
			name: "normal",
			shaderLocation: 2,
			offset: 20,
			format: "float32x3",
		},
		{
			name: "tangent",
			shaderLocation: 3,
			offset: 32,
			format: "float32x3",
		},
	],
};

export class Renderer extends BaseRenderer {
	constructor(canvas) {
		super(canvas);
	}

	async initialize() {
		await super.initialize();

		const code = await fetch("./engine/renderers/shader.wgsl").then(
			(response) => response.text()
		);
		const module = this.device.createShaderModule({ code });

		this.pipeline = await this.device.createRenderPipelineAsync({
			layout: "auto",
			vertex: {
				module,
				buffers: [vertexBufferLayout],
			},
			fragment: {
				module,
				targets: [{ format: this.format }],
			},
			depthStencil: {
				format: "depth24plus",
				depthWriteEnabled: true,
				depthCompare: "less",
			},
		});

		this.recreateDepthTexture();
	}

	recreateDepthTexture() {
		this.depthTexture?.destroy();
		this.depthTexture = this.device.createTexture({
			format: "depth24plus",
			size: [this.canvas.width, this.canvas.height],
			usage: GPUTextureUsage.RENDER_ATTACHMENT,
		});
	}

	prepareNode(node) {
		if (this.gpuObjects.has(node)) {
			return this.gpuObjects.get(node);
		}

		const modelUniformBuffer = this.device.createBuffer({
			size: 128,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
		});

		const modelBindGroup = this.device.createBindGroup({
			layout: this.pipeline.getBindGroupLayout(2),
			entries: [{ binding: 0, resource: { buffer: modelUniformBuffer } }],
		});

		const gpuObjects = { modelUniformBuffer, modelBindGroup };
		this.gpuObjects.set(node, gpuObjects);
		return gpuObjects;
	}

	prepareCamera(camera) {
		if (this.gpuObjects.has(camera)) {
			return this.gpuObjects.get(camera);
		}

		const cameraUniformBuffer = this.device.createBuffer({
			size: 144,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
		});

		const cameraBindGroup = this.device.createBindGroup({
			layout: this.pipeline.getBindGroupLayout(0),
			entries: [
				{ binding: 0, resource: { buffer: cameraUniformBuffer } },
			],
		});

		const gpuObjects = { cameraUniformBuffer, cameraBindGroup };
		this.gpuObjects.set(camera, gpuObjects);
		return gpuObjects;
	}

	prepareLight(light) {
		if (this.gpuObjects.has(light)) {
			return this.gpuObjects.get(light);
		}

		const lightUniformBuffer = this.device.createBuffer({
			size: 48,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
		});

		const lightBindGroup = this.device.createBindGroup({
			layout: this.pipeline.getBindGroupLayout(1),
			entries: [{ binding: 0, resource: { buffer: lightUniformBuffer } }],
		});

		const gpuObjects = { lightUniformBuffer, lightBindGroup };
		this.gpuObjects.set(light, gpuObjects);
		return gpuObjects;
	}

	prepareTexture(texture) {
		if (this.gpuObjects.has(texture)) {
			return this.gpuObjects.get(texture);
		}

		const { gpuTexture } = this.prepareImage(texture.image, texture.isSRGB);
		const { gpuSampler } = this.prepareSampler(texture.sampler);

		const gpuObjects = { gpuTexture, gpuSampler };
		this.gpuObjects.set(texture, gpuObjects);
		return gpuObjects;
	}

	prepareMaterial(material) {
		if (this.gpuObjects.has(material)) {
			return this.gpuObjects.get(material);
		}

		const baseTexture = this.prepareTexture(material.baseTexture);
		const normalTexture = this.prepareTexture(material.normalTexture);

		const materialUniformBuffer = this.device.createBuffer({
			size: 32,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
		});

		const materialBindGroup = this.device.createBindGroup({
			layout: this.pipeline.getBindGroupLayout(3),
			entries: [
				{ binding: 0, resource: { buffer: materialUniformBuffer } },
				{ binding: 1, resource: baseTexture.gpuTexture.createView() },
				{ binding: 2, resource: baseTexture.gpuSampler },
				{ binding: 3, resource: normalTexture.gpuTexture.createView() },
				{ binding: 4, resource: normalTexture.gpuSampler },
			],
		});

		const gpuObjects = { materialUniformBuffer, materialBindGroup };
		this.gpuObjects.set(material, gpuObjects);
		return gpuObjects;
	}

	render(scene, camera) {
		if (
			this.depthTexture.width !== this.canvas.width ||
			this.depthTexture.height !== this.canvas.height
		) {
			this.recreateDepthTexture();
		}

		const encoder = this.device.createCommandEncoder();
		this.renderPass = encoder.beginRenderPass({
			colorAttachments: [
				{
					view: this.context.getCurrentTexture().createView(),
					clearValue: [1, 1, 1, 1],
					loadOp: "clear",
					storeOp: "store",
				},
			],
			depthStencilAttachment: {
				view: this.depthTexture.createView(),
				depthClearValue: 1,
				depthLoadOp: "clear",
				depthStoreOp: "discard",
			},
		});
		this.renderPass.setPipeline(this.pipeline);

		const cameraComponent = camera.getComponentOfType(Camera);
		const viewMatrix = getGlobalViewMatrix(camera);
		const projectionMatrix = getProjectionMatrix(camera);
		const cameraPosition = mat4.getTranslation(
			vec3.create(),
			getGlobalModelMatrix(camera)
		);
		const { cameraUniformBuffer, cameraBindGroup } =
			this.prepareCamera(cameraComponent);
		this.device.queue.writeBuffer(cameraUniformBuffer, 0, viewMatrix);
		this.device.queue.writeBuffer(
			cameraUniformBuffer,
			64,
			projectionMatrix
		);
		this.device.queue.writeBuffer(cameraUniformBuffer, 128, cameraPosition);
		this.renderPass.setBindGroup(0, cameraBindGroup);

		const light = scene.find((node) => node.getComponentOfType(Light));
		const lightComponent = light.getComponentOfType(Light);
		const lightColor = vec3.scale(
			vec3.create(),
			lightComponent.color,
			lightComponent.intensity / 255
		);
		const lightPosition = mat4.getTranslation(
			vec3.create(),
			getGlobalModelMatrix(light)
		);
		const lightAttenuation = vec3.clone(lightComponent.attenuation);
		const { lightUniformBuffer, lightBindGroup } =
			this.prepareLight(lightComponent);
		this.device.queue.writeBuffer(lightUniformBuffer, 0, lightColor);
		this.device.queue.writeBuffer(lightUniformBuffer, 16, lightPosition);
		this.device.queue.writeBuffer(lightUniformBuffer, 32, lightAttenuation);
		this.renderPass.setBindGroup(1, lightBindGroup);

		this.renderNode(scene);

		this.renderPass.end();
		this.device.queue.submit([encoder.finish()]);
	}

	renderNode(node, modelMatrix = mat4.create()) {
		const localMatrix = getLocalModelMatrix(node);
		modelMatrix = mat4.multiply(mat4.create(), modelMatrix, localMatrix);
		const normalMatrix = mat4.normalFromMat4(mat4.create(), modelMatrix);

		const { modelUniformBuffer, modelBindGroup } = this.prepareNode(node);
		this.device.queue.writeBuffer(modelUniformBuffer, 0, modelMatrix);
		this.device.queue.writeBuffer(modelUniformBuffer, 64, normalMatrix);
		this.renderPass.setBindGroup(2, modelBindGroup);

		for (const model of node.getComponentsOfType(Model)) {
			this.renderModel(model);
		}

		for (const child of node.children) {
			this.renderNode(child, modelMatrix);
		}
	}

	renderModel(model) {
		for (const primitive of model.primitives) {
			this.renderPrimitive(primitive);
		}
	}

	renderPrimitive(primitive) {
		const material = primitive.material;
		const { materialUniformBuffer, materialBindGroup } =
			this.prepareMaterial(primitive.material);
		this.device.queue.writeBuffer(
			materialUniformBuffer,
			0,
			new Float32Array([
				...material.baseFactor,
				material.normalFactor,
				material.diffuse,
				material.specular,
				material.shininess,
			])
		);
		this.renderPass.setBindGroup(3, materialBindGroup);

		const { vertexBuffer, indexBuffer } = this.prepareMesh(
			primitive.mesh,
			vertexBufferLayout
		);
		this.renderPass.setVertexBuffer(0, vertexBuffer);
		this.renderPass.setIndexBuffer(indexBuffer, "uint32");

		this.renderPass.drawIndexed(primitive.mesh.indices.length);
	}
}
