import * as THREE from "three";
import { OrbitControls } from '../build/jsm/controls/OrbitControls.js';
import {
  initRenderer,
  initDefaultBasicLight,
  onWindowResize,
  InfoBox,
} from "../libs/util/util.js";
import { createPlane } from "./Plano.js"; 

let scene, renderer, light, orbit; // Initial variables
const clock = new THREE.Clock();
scene = new THREE.Scene(); // Create main scene
renderer = initRenderer(); // Init a basic renderer
var camera = new THREE.PerspectiveCamera(
  65,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.set(-200.0, 20.0, 0.0);
camera.up.set(0, 1, 0);
camera.lookAt(0, 0, 0);

light = initDefaultBasicLight(scene); // Create a basic light to illuminate the scene
orbit = new OrbitControls(camera, renderer.domElement); // Enable mouse rotation, pan, zoom etc.

// Listen window size changes
window.addEventListener(
  "resize",
  function () {
    onWindowResize(camera, renderer);
  },
  false
);


let plano = createPlane();
scene.add(plano);

// Show axes (parameter is size of each axis)
let axesHelper = new THREE.AxesHelper(12);
scene.add(axesHelper);

let controls = new InfoBox();
controls.add("Basic Scene");
controls.addParagraph();
controls.add("Use mouse to interact:");
controls.add("* Left button to rotate");
controls.add("* Right button to translate (pan)");
controls.add("* Scroll to zoom in/out.");
controls.show();

render();

function render() {
  const delta = clock.getDelta();
  requestAnimationFrame(render);
  renderer.render(scene, camera); 
}


/*function movePlane(){
 
const planeSize = 100; // Tamanho do plano
const maxPlanes = 3; // Número máximo de planos visíveis

// Array para armazenar os planos
const planeArray = [];

const objectPosition = { x: 0, z: 0 }; // Posição inicial do objeto em movimento

  // Verifica se o número máximo de planos visíveis foi alcançado
  if (planeArray.length >= maxPlanes) {
    // Remove o plano mais distante
    const removedPlane = planeArray.shift();
    scene.remove(removedPlane);
  }

  // Calcula a posição do próximo plano a ser adicionado
  const nextPlanePosition = {
    x: objectPosition.x + (planeArray.length + 1) * planeSize,
    z: objectPosition.z,
  };

  // Adiciona um novo plano à frente do objeto
  const newPlane = addPlaneGroupsWithFadeIn(nextPlanePosition, planeSize);
  planeArray.push(newPlane);
}

function addPlaneGroupsWithFadeIn(objectPosition, planeSize) {
  const fadeInDistance = 100; // Distância para começar o efeito de fade in

  const planeGroup = plane(objectPosition, planeSize);
  scene.add(planeGroup);

  updateFadeIn(20, fadeInDistance, objectPosition, planeGroup);
}

function updateFadeIn(cubeSize, fadeInDistance, objectPosition, planeGroup) {
  const distanceThreshold = cubeSize * fadeInDistance;
  const objectX = objectPosition.x;
  const objectZ = objectPosition.z;

  planeGroup.traverse(function (child) {
    if (child.isMesh) {
      const distance = Math.sqrt(
        (child.position.x - objectX) ** 2 + (child.position.z - objectZ) ** 2
      );

      if (distance <= distanceThreshold) {
        const opacity = 1 - distance / distanceThreshold;
        setOpacity(child, opacity);
      } else {
        setOpacity(child, 0);
      }
    }
  });
}

function setOpacity(object, opacity) {
  object.traverse(function (node) {
    if (node.isMesh) {
      node.material.opacity = opacity;
      node.material.transparent = opacity < 1;
    }
  });
}*/

  
export { scene };
