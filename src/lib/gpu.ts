import { match } from "ts-pattern"
import computeShaderCode from "@/lib/compute-shader.wgsl?raw"
import type { Dimension, Position } from "@/lib/jotai"
import type { GameOfLife } from "@/lib/logic"
import renderShaderCode from "@/lib/render-shader.wgsl?raw"

export class Gpu implements GameOfLife {
	canvas: HTMLCanvasElement
	gameDimension: Dimension
	device: GPUDevice
	currentGridId: "one" | "two" = "one"
	context: GPUCanvasContext
	computeUniformBuffer: GPUBuffer
	renderUniformBuffer: GPUBuffer
	gridOneBuffer: GPUBuffer
	gridTwoBuffer: GPUBuffer
	computeBindGroupLayout: GPUBindGroupLayout
	computePipeline: GPUComputePipeline
	renderBindGroupLayout: GPUBindGroupLayout
	renderPipeline: GPURenderPipeline

	constructor(
		canvas: HTMLCanvasElement,
		gameDimension: Dimension,
		device: GPUDevice,
	) {
		this.canvas = canvas
		this.gameDimension = gameDimension
		this.device = device

		const context = canvas.getContext("webgpu")
		if (!context) {
			throw new Error("Failed to get WebGPU context")
		}
		const presentationFormat = navigator.gpu.getPreferredCanvasFormat()
		context.configure({
			device,
			format: presentationFormat,
		})
		this.context = context

		const computeUniformSizeDescription = {
			gameDimension: 2 * 4,
		}

		const computeUniformSize = Object.values(
			computeUniformSizeDescription,
		).reduce((acc, c) => acc + c)

		this.computeUniformBuffer = this.device.createBuffer({
			size: computeUniformSize,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
		})

		const computeUniformBuffer = new Uint32Array(2)
		computeUniformBuffer[0] = this.gameDimension.width
		computeUniformBuffer[1] = this.gameDimension.height

		this.device.queue.writeBuffer(
			this.computeUniformBuffer,
			0,
			computeUniformBuffer,
		)

		const renderUniformSizeDescription = {
			minimapStart: 2 * 4, // Vec2u,
			minimapDimension: 2 * 4, // Vec2u
			gameDimension: 2 * 4, // Vec2u
			canvasDimension: 2 * 4,
		}

		const renderUniformSize = Object.values(
			renderUniformSizeDescription,
		).reduce((acc, c) => acc + c)

		this.renderUniformBuffer = this.device.createBuffer({
			size: renderUniformSize,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
		})

		this.gridOneBuffer = this.device.createBuffer({
			size: this.gameDimension.width * this.gameDimension.height * 4,
			usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
		})

		this.gridTwoBuffer = this.device.createBuffer({
			size: this.gameDimension.width * this.gameDimension.height * 4,
			usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
		})

		this.computeBindGroupLayout = this.device.createBindGroupLayout({
			entries: [
				{
					binding: 0,
					visibility: GPUShaderStage.COMPUTE,
					buffer: { type: "uniform" },
				},
				{
					binding: 1,
					visibility: GPUShaderStage.COMPUTE,
					buffer: { type: "read-only-storage" },
				},
				{
					binding: 2,
					visibility: GPUShaderStage.COMPUTE,
					buffer: { type: "storage" },
				},
			],
		})

		this.computePipeline = this.device.createComputePipeline({
			layout: this.device.createPipelineLayout({
				bindGroupLayouts: [this.computeBindGroupLayout],
			}),
			compute: {
				module: this.device.createShaderModule({
					code: computeShaderCode,
				}),
			},
		})

		this.renderBindGroupLayout = this.device.createBindGroupLayout({
			entries: [
				{
					binding: 0,
					visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
					buffer: { type: "uniform" },
				},
				{
					binding: 1,
					visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
					buffer: {
						type: "read-only-storage",
					},
				},
			],
		})

		const renderShaderModule = this.device.createShaderModule({
			code: renderShaderCode,
		})

		this.renderPipeline = this.device.createRenderPipeline({
			layout: this.device.createPipelineLayout({
				bindGroupLayouts: [this.renderBindGroupLayout],
			}),
			vertex: {
				module: renderShaderModule,
			},
			fragment: {
				module: renderShaderModule,
				targets: [
					{
						format: navigator.gpu.getPreferredCanvasFormat(),
					},
				],
			},
		})
	}

	setGame(grid: Uint32Array): void {
		this.device.queue.writeBuffer(this.currentBuffer, 0, grid)
	}

	get currentBuffer(): GPUBuffer {
		return match(this.currentGridId)
			.with("one", () => this.gridOneBuffer)
			.with("two", () => this.gridTwoBuffer)
			.exhaustive()
	}

	get nextBuffer(): GPUBuffer {
		return match(this.currentGridId)
			.with("one", () => this.gridTwoBuffer)
			.with("two", () => this.gridOneBuffer)
			.exhaustive()
	}

	step(): number {
		const computeBindGroup = this.device.createBindGroup({
			layout: this.computeBindGroupLayout,
			entries: [
				{
					binding: 0,
					resource: this.computeUniformBuffer,
				},
				{
					binding: 1,
					resource: this.currentBuffer,
				},
				{
					binding: 2,
					resource: this.nextBuffer,
				},
			],
		})
		const commandEncoder = this.device.createCommandEncoder()
		const computePass = commandEncoder.beginComputePass()
		computePass.setPipeline(this.computePipeline)
		computePass.setBindGroup(0, computeBindGroup)
		computePass.dispatchWorkgroups(
			Math.ceil(this.gameDimension.width / 16),
			Math.ceil(this.gameDimension.height / 16),
		)
		computePass.end()

		const commandBuffer = commandEncoder.finish()
		this.device.queue.submit([commandBuffer])
		if (this.currentGridId === "one") {
			this.currentGridId = "two"
		} else {
			this.currentGridId = "one"
		}
		return Date.now()
	}

	draw(start: Position, dimension: Dimension): void {
		const renderUniformData = new ArrayBuffer(32)
		const renderUniformU32 = new Uint32Array(renderUniformData)
		const renderUniformF32 = new Float32Array(renderUniformData)

		renderUniformU32[0] = start.x
		renderUniformU32[1] = start.y
		renderUniformU32[2] = dimension.width
		renderUniformU32[3] = dimension.height
		renderUniformU32[4] = this.gameDimension.width
		renderUniformU32[5] = this.gameDimension.height
		renderUniformF32[6] = this.canvas.width
		renderUniformF32[7] = this.canvas.height

		this.device.queue.writeBuffer(
			this.renderUniformBuffer,
			0,
			renderUniformData,
		)

		const renderBindGroup = this.device.createBindGroup({
			layout: this.renderBindGroupLayout,
			entries: [
				{
					binding: 0,
					resource: this.renderUniformBuffer,
				},
				{
					binding: 1,
					resource: this.currentBuffer,
				},
			],
		})

		const commandEncoder = this.device.createCommandEncoder()
		const view = this.context.getCurrentTexture().createView()
		const renderPass = commandEncoder.beginRenderPass({
			colorAttachments: [
				{
					loadOp: "clear",
					storeOp: "store",
					view,
				},
			],
		})
		renderPass.setPipeline(this.renderPipeline)
		renderPass.setBindGroup(0, renderBindGroup)
		renderPass.draw(6, dimension.width * dimension.height)
		renderPass.end()

		const commandBuffer = commandEncoder.finish()
		this.device.queue.submit([commandBuffer])
	}

	clear() {
		this.gridOneBuffer.destroy()
		this.gridTwoBuffer.destroy()
		this.renderUniformBuffer.destroy()
		this.computeUniformBuffer.destroy()
	}
}
