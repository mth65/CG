import * as THREE from "three";
import { FlyControls } from "../build/jsm/controls/FlyControls.js";
import {
  initRenderer,
  initDefaultBasicLight,
  setDefaultMaterial,
  InfoBox,
  onWindowResize,
  createGroundPlaneWired,
} from "../libs/util/util.js";
import { Arvore } from "./Arvore.js";
import { Plano } from "./Plano.js";
import { Aviao } from "./Aviao.js";

let scene, renderer, aviao, materialTrunk, materialLeaves, light, orbit; // Initial variables
const numArvores = 700;
const clock = new THREE.Clock();
scene = new THREE.Scene(); // Create main scene
renderer = initRenderer(); // Init a basic renderer
var camera = new THREE.PerspectiveCamera(
  65,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
var plano = new Plano(scene);
camera.position.set(-200.0, 20.0, 0.0);
camera.up.set(0, 1, 0);
camera.lookAt(0, 0, 0);

light = initDefaultBasicLight(scene); // Create a basic light to illuminate the scene

//create a fly camera
var flyCamera = new FlyControls(camera, renderer.domElement);
flyCamera.movementSpeed = 50;
flyCamera.domElement = renderer.domElement;
flyCamera.rollSpeed = 0.2;
flyCamera.autoForward = true;
flyCamera.dragToLook = false;

// Listen window size changes
window.addEventListener(
  "resize",
  function () {
    onWindowResize(camera, renderer);
  },
  false
);

// Show axes (parameter is size of each axis)
let axesHelper = new THREE.AxesHelper(12);
scene.add(axesHelper);
if (!aviao) {
  aviao = new Aviao(scene);
}
//--ARVORE--

//materiais das ávores
materialTrunk = setDefaultMaterial("brown");
materialTrunk.transparent = true;
//material folha
materialLeaves = setDefaultMaterial("green");
materialLeaves.transparent = true;

// create a tree
for (let i = 0; i < numArvores; i++) {
  var arvore = new Arvore(materialLeaves, materialTrunk);
  scene.add(arvore);
  arvore.rotation.x = Math.PI / 2;
  plano.plano1.add(arvore);
}

for (let i = 0; i < numArvores; i++) {
  var arvore = new Arvore(materialLeaves, materialTrunk);
  scene.add(arvore);
  arvore.rotation.x = Math.PI / 2;
  plano.plano2.add(arvore);
}

showInformation();
render();

function showInformation() {
  var controls = new InfoBox();
  controls.add("Fly Controls");
  controls.addParagraph();
  controls.add("Keyboard:");
  controls.add("* WASD - Move");
  controls.add("* R | F - up | down");
  controls.add("* Q | E - roll");
  controls.addParagraph();
  controls.add("Mouse and Keyboard arrows:");
  controls.add("* up | down    - pitch");
  controls.add("* left | right - yaw");
  controls.addParagraph();
  controls.add("Mouse buttons:");
  controls.add("* Left  - Move forward");
  controls.add("* Right - Move backward");
  // controls.add(flyCamera.position.getComponent(0));

  controls.show();
}

function render() {
  aviao.rotateCylinder();
  const delta = clock.getDelta();
  //stats.update();
  flyCamera.update(delta);
  requestAnimationFrame(render);
  renderer.render(scene, camera); // Render scene
  let posicaoCameraX = flyCamera.object.position.getComponent(0);
  plano.desenhaPlano(posicaoCameraX);
}

export { scene };
