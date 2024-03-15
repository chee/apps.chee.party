export {}
import * as three from "./vendor/three.module.js"

let fragmentElement = /** @type {HTMLTextAreaElement} */ (
	document.getElementById("fragment")
)
let vertexElement = /** @type {HTMLTextAreaElement} */ (
	document.getElementById("vertex")
)

let mideo = {
	index: 0,
	/** @type {HTMLVideoElement[]} */
	videos: [],
	get fragment() {
		return fragmentElement.value
	},
	get vertex() {
		return vertexElement.value
	},
	get video() {
		return this.videos[this.index]
	},
	add(src = "") {
		let video = document.createElement("video")
		video.loop = true
		video.volume = 0
		video.src = src
		this.videos.push(video)
	},
	width: 704,
	height: 576
}

let scene = new three.Scene()
let camera = new three.PerspectiveCamera(
	75,
	mideo.width / mideo.height,
	0.1,
	100
)

let renderer = new three.WebGLRenderer()
renderer.setSize(mideo.width, mideo.height)
document.body.prepend(renderer.domElement)

/** @param {HTMLVideoElement} video */
function createTexture(video) {
	let texture = new three.VideoTexture(video)
	texture.minFilter = three.LinearFilter
	texture.magFilter = three.LinearFilter
	return texture
}

let geometry = new three.PlaneGeometry(11, 9)
// geometry.scale(0.5, 0.5, 0.5)

let texture = createTexture(document.createElement("video"))

let material = new three.ShaderMaterial({
	uniforms: {
		u_time: {type: "f", value: 1},
		u_resolution: {
			type: "v2",
			value: new three.Vector2(mideo.width, mideo.height)
		},
		u_texture: {value: texture},
		u_note: {value: mideo.index},
		u_velocity: {value: 64},
		u_channel: {value: 1}
	},
	depthTest: false,
	depthWrite: false,
	transparent: true,
	vertexShader: mideo.vertex,
	fragmentShader: mideo.fragment
})

let mesh = new three.Mesh(geometry, material)

scene.add(mesh)
camera.position.z = 5

function animate(now) {
	material.uniforms.u_time.value += now / 1000

	renderer.render(scene, camera)

	requestAnimationFrame(animate)
}

requestAnimationFrame(animate)

// while (mideo.video.readyState != 3) {}

renderer.domElement.addEventListener("click", () => {
	renderer.domElement.requestFullscreen()
})

document.querySelectorAll("figure").forEach(figure => {
	figure.addEventListener("keyup", () => {
		material.fragmentShader = mideo.fragment
		material.vertexShader = mideo.vertex
		material.needsUpdate = true
	})
})

let midi = await navigator.requestMIDIAccess({
	software: true
	// sysex: true
})

let inputs = [...midi.inputs]
let [, delugeInput] = inputs.find(([string, device]) =>
	device.name.startsWith("Deluge")
)

let deluge = await delugeInput.open()

let MidiMessage = {
	NoteOff: 0x8,
	NoteOn: 0x9,
	Pressure: 0xa,
	CC: 0xb,
	bend: 0xe
}

deluge.addEventListener("midimessage", event => {
	let data = event.data
	let [msg] = data
	let byte = msg.toString(16)
	let [type, channel] = byte
	if (type == MidiMessage.NoteOn) {
		let note = data[1]
		let velo = data[2]
		if (mideo.video) {
			mideo.video.pause()
		}
		let last = mideo.index
		mideo.index = note
		if (mideo.video) {
			if (last != note) {
				texture.dispose()
				texture = new three.VideoTexture(mideo.video)
				material.uniforms.u_texture.value = texture
			}
			material.uniforms.u_note.value = note
			material.uniforms.u_velocity.value = velo
			material.uniforms.u_channel.value = Number(channel)
			mideo.video.currentTime = 0
			mideo.video.play()
		}
	}
})

window.mideo = mideo

// navigator.permissions.query({name: "midi", sysex: true}).then(permission => {
// 	console.log(permission, permission.state)
// })

let html = document.documentElement

window.addEventListener("dragenter", async function (event) {
	event.preventDefault()
	let {items} = event.dataTransfer
	for (let item of Array.from(items)) {
		if (item.kind == "file") {
			console.log("hey there")
			if (item.type.startsWith("video/")) {
				html.setAttribute("drop-target", "drop-target")
			} else {
				console.debug(`unsupported type: ${item.kind}, ${event.type}`)
			}
		}
	}
	event.preventDefault()
})
window.addEventListener(
	"dragover" /** @param {DragEvent} event */,
	async function dragover(event) {
		event.preventDefault()

		let {items} = event.dataTransfer
		for (let item of Array.from(items)) {
			// TODO restrict to supported formats by trying to decode a silent audio
			// item of all the formats anyone supports?
			if (item.kind == "file") {
				if (item.type.startsWith("video/")) {
					html.setAttribute("drop-target", "")
				} else {
					console.error(`unsupported type: ${item.kind}, ${event.type}`)
				}
			}
		}
	}
)
window.addEventListener(
	"dragleave" /** @param {DragEvent} event */,
	async function dragleave(event) {
		event.preventDefault()
		html.removeAttribute("drop-target")
	}
)
window.addEventListener(
	"drop" /** @param {DragEvent} event */,
	async function drop(event) {
		html.removeAttribute("drop-target")
		if (event.dataTransfer.items) {
			event.preventDefault()
			for (let item of Array.from(event.dataTransfer.items)) {
				if (item.kind == "file") {
					let file = item.getAsFile()
					let ab = await file.arrayBuffer()
					let blob = new Blob([ab])
					let url = URL.createObjectURL(blob)
					mideo.add(url)
				}
			}
		}
	}
)
