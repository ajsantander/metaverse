import axios from 'axios'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

let data
let scene, renderer
let camera, cameraControls

async function main() {
  await fetchData()

  initEngine()

  buildScene()

  renderLoop()
}

async function fetchData() {
  const query = `query {
  organisations(take: 30, sort: { score: DESC }) {
    nodes {
      ens
      address
      score
      aum
      ant
      activity
    }
  }
}`

  const rawResponse = await fetch('https://daolist.1hive.org', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })

  const response = await rawResponse.json()

  data = response.data
}

function initEngine() {
  scene = new THREE.Scene()

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.1)
  scene.add(ambientLight)

  const pointLight = new THREE.PointLight(0xffffff, 1, 100)
  pointLight.position.set(50, 50, 50)
  scene.add(pointLight)

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

function addNode(position, radius) {
  const geometry = new THREE.SphereGeometry(radius, 12, 12)

  const material = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    specular: 0xffffff,
    shininess: 30,
    flatShading: false
  })

  const sphere = new THREE.Mesh(geometry, material)
  sphere.position.set(...position)

  scene.add(sphere);
}

function randomNum(min, max) {
  return (max - min) * Math.random() + min
}

function randomPos(min, max) {
  return [
    randomNum(min, max),
    randomNum(min, max),
    randomNum(min, max)
  ]
}

function buildScene() {
  const posMin = -5
  const posMax = 5
  const radiusMultiplier = 3

  for (const node of data.organisations.nodes) {
    console.log(`node`, node)

    addNode(randomPos(posMin, posMax), radiusMultiplier * node.score)
  }
}

function renderLoop() {
	requestAnimationFrame(renderLoop)

  cameraControls.update()

	renderer.render(scene, camera)
}

main()
