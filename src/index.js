import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

let scene, renderer
let camera, cameraControls

function init() {
  scene = new THREE.Scene()

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

  scene.add(new THREE.AmbientLight(0xffffff, 0.1))

  const light = new THREE.PointLight(0xffffff, 1, 100)
  light.position.set(50, 50, 50)
  scene.add(light)

  renderer = new THREE.WebGLRenderer()
  renderer.setSize(window.innerWidth, window.innerHeight)

  cameraControls = new OrbitControls(camera, renderer.domElement)
  cameraControls.enableDamping = true;
  cameraControls.dampingFactor = 0.05;
  cameraControls.screenSpacePanning = false;
  cameraControls.minDistance = 10;
  cameraControls.maxDistance = 50;
  cameraControls.maxPolarAngle = Math.PI / 2;

  document.body.appendChild(renderer.domElement)
}

function buildSampleScene() {
  const geometry = new THREE.SphereGeometry()

  // const material = new THREE.MeshBasicMaterial({ color: 0x0000FF })
  const material = new THREE.MeshPhongMaterial({ color: 0xFFFFFF, specular: 0xFFFFFF, shininess: 30, flatShading: false })

  const cube = new THREE.Mesh(geometry, material)

  scene.add(cube);
}

function renderLoop() {
	requestAnimationFrame(renderLoop)

  cameraControls.update()

	renderer.render(scene, camera)
}

init()
buildSampleScene()
renderLoop()
