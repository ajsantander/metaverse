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

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100000)

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
  // cameraControls.maxPolarAngle = Math.PI / 2;

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

function buildSky() {
  const assetPath = '../skybox/space1'

  const materialArray = []
  const texture_ft = new THREE.TextureLoader().load(`${assetPath}/front.png`)
  const texture_bk = new THREE.TextureLoader().load(`${assetPath}/back.png`)
  const texture_up = new THREE.TextureLoader().load(`${assetPath}/top.png`)
  const texture_dn = new THREE.TextureLoader().load(`${assetPath}/bottom.png`)
  const texture_rt = new THREE.TextureLoader().load(`${assetPath}/right.png`)
  const texture_lf = new THREE.TextureLoader().load(`${assetPath}/left.png`)

  materialArray.push(new THREE.MeshBasicMaterial({ map: texture_ft }))
  materialArray.push(new THREE.MeshBasicMaterial({ map: texture_bk }))
  materialArray.push(new THREE.MeshBasicMaterial({ map: texture_up }))
  materialArray.push(new THREE.MeshBasicMaterial({ map: texture_dn }))
  materialArray.push(new THREE.MeshBasicMaterial({ map: texture_lf }))
  materialArray.push(new THREE.MeshBasicMaterial({ map: texture_rt }))

  for (let i = 0; i < 6; i++) {
    materialArray[i].side = THREE.BackSide
  }

  const size = 10000
  const skyboxGeo = new THREE.BoxGeometry(size, size, size)
  const skybox = new THREE.Mesh(skyboxGeo, materialArray)
  scene.add(skybox)
}

function buildScene() {
  const posMin = -5
  const posMax = 5
  const radiusMultiplier = 5

  for (const node of data.organisations.nodes) {
    // console.log(`node`, node)

    addNode(randomPos(posMin, posMax), radiusMultiplier * node.score)
  }

  buildSky()
}

function renderLoop() {
	requestAnimationFrame(renderLoop)

  cameraControls.update()

	renderer.render(scene, camera)
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

main()
