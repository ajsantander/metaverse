import axios from 'axios'
import * as THREE from 'three'
import { FlyControls } from 'three/examples/jsm/controls/FlyControls'

let data
let scene, renderer
let camera, controls
let sphereGeometry, sphereMaterial

async function main() {
  await fetchData()

  initEngine()

  buildScene()

  renderLoop()
}

async function fetchData() {
  const query = `query {
  organisations(take: 50, sort: { score: DESC }) {
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

  renderer = new THREE.WebGLRenderer()
  renderer.setSize(window.innerWidth, window.innerHeight)

  controls = new FlyControls(camera, renderer.domElement)
  controls.domElement = renderer.domElement
  controls.movementSpeed = 40
  controls.rollSpeed = 4 * Math.PI
  controls.autoForward = false
  controls.dragToLook = false

  document.body.appendChild(renderer.domElement)
}

function createPlanet(position, radius) {
  if (!sphereGeometry) {
    sphereGeometry = new THREE.SphereBufferGeometry(1, 12, 12)
  }

  if (!sphereMaterial) {
    sphereMaterial = new THREE.MeshPhongMaterial({
      color: 0x00ff00,
      specular: 0xff00ff,
      shininess: 30,
      flatShading: false
    })
  }

  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
  sphere.position.set(...position)
  sphere.scale.set(radius, radius, radius)

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

function buildLights() {
  const sphere = new THREE.SphereBufferGeometry(0.5, 16, 16)

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
  scene.add(ambientLight)

  const pointLight = new THREE.PointLight(0xffffff, 1, 100)
  // pointLight.add(new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({ color: 0xff0040 })))
  pointLight.position.set(50, 30, -20)
  scene.add(pointLight)
}

let material
function buildStars() {
  var geometry = new THREE.BufferGeometry();
  var vertices = [];

  var sprite = new THREE.TextureLoader().load( '../disc.png' );

  const min = -30
  const max = 30
  for ( var i = 0; i < 30000; i ++ ) {

    vertices.push(
      randomNum(min, max),
      randomNum(min, max),
      randomNum(min, max)
    );

  }

  // scene.fog = new THREE.FogExp2( 0x000000, 0.0002 )

  geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );

  material = new THREE.PointsMaterial( { size: 0.03, sizeAttenuation: true, map: sprite, alphaTest: 0.5, transparent: false } );

  material.color.set('0x111111')

  var particles = new THREE.Points( geometry, material );
  scene.add( particles );
}

function buildPlanets() {
  const posMin = -100
  const posMax = 100
  const radiusMultiplier = 80
  const radiusMin = 0.007

  for (const node of data.organisations.nodes) {
    // console.log(`node`, node)

    const posMultiplier = 2 * node.score
    createPlanet(
      randomPos(
        posMultiplier * posMin,
        posMultiplier * posMax
      ),
      radiusMultiplier * node.score * node.score + radiusMin
    )
  }
}

function buildScene() {
  // scene.add(new THREE.AxesHelper(0.1))

  buildPlanets()

  buildStars()

  buildLights()

  buildSky()
}

function renderLoop() {
	requestAnimationFrame(renderLoop)

  controls.update(0.001)

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
