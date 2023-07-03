import * as THREE from "three";
import { OrbitControls } from "../build/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "../build/jsm/loaders/GLTFLoader.js";
import { Arvore } from "./Arvore.js";
import { Plano } from "./Plano.js";
import {
  initRenderer,
  InfoBox,
  onWindowResize,
  getMaxSize,
} from "../libs/util/util.js";
import {
  MeshLambertMaterial,
  MeshPhongMaterial,
} from "../build/three.module.js";
import { Tiro } from "./Tiro.js";
import KeyboardState from "../libs/util/KeyboardState.js";

let scene, renderer, camera, orbit; // Initial variables
let isPaused = false;
let isCursorVisible = false;
document.body.style.cursor = "none";
let torretas = [];
var lastMousePosition = new THREE.Vector2(); // Última posição do mouse
var teclado = new KeyboardState();
scene = new THREE.Scene(); // Create main scene
renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//Main Camera

let camPos = new THREE.Vector3(0.0, 30.0, 70.0);
let camUp = new THREE.Vector3(0.0, 1.0, 0.0);

camera = new THREE.PerspectiveCamera(
  65,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.copy(camPos);
camera.up.copy(camUp);
let cameraHolder = new THREE.Object3D();
cameraHolder.add(camera);
scene.add(cameraHolder);

var plano = new Plano(scene);
criaNovasTorretas(0);
criaNovasTorretas(-500);
criaNovasTorretas(-1000);

//Plano do Raycaster
// Variáveis para armazenar a posição do mouse
const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
var planeGeometry = new THREE.PlaneGeometry(100, 98);
var planeMaterial = new THREE.MeshBasicMaterial({ visible: false });
var raycastPlane = new THREE.Mesh(planeGeometry, planeMaterial);
raycastPlane.translateY(15);
raycastPlane.translateX(-2.8);
scene.add(raycastPlane);

//Luz

const ambientColor = "rgb(50,50,50)";
let ambientLight = new THREE.AmbientLight(ambientColor);
scene.add(ambientLight);
let lightPosition = new THREE.Vector3(10, 15, 0);
let lightColor = "rgb(255,255,255)";
let dirLight = new THREE.DirectionalLight(lightColor);
setDirectionalLighting(lightPosition);

//definindo controles
orbit = new OrbitControls(camera, renderer.domElement); // Enable mouse rotation, pan, zoom etc.
// orbit.enableRotate = false;
orbit.enabled = false;

// Listen window size changes
window.addEventListener(
  "resize",
  function () {
    onWindowResize(camera, renderer);
  },
  false
);
window.addEventListener("mousemove", onMouseMove, false);
window.addEventListener("contextmenu", onRightClick, false);
window.addEventListener("keydown", onKeyPress, false);
// Assets manager --------------------------------
let assetManager = {
  // Properties ---------------------------------
  aviao: null,
  turreta: null,
  allLoaded: false,

  // Functions ----------------------------------
  checkLoaded: function () {
    if (!this.allLoaded) {
      if (this.aviao && this.turreta) {
        this.allLoaded = true;
        loadingMessage.hide();
      }
    }
  },

  hideAll: function () {
    this.aviao.visible = this.turreta = false;
  },
};
// Show axes (parameter is size of each axis)
let axesHelper = new THREE.AxesHelper(30);
scene.add(axesHelper);

// Use this to show information onscreen
let controls = new InfoBox();
controls.add("Basic Scene");
controls.addParagraph();
controls.add("Use mouse to interact:");
controls.add("* Left button to rotate");
controls.add("* Right button to translate (pan)");
controls.add("* Scroll to zoom in/out.");
controls.show();

//--ARVORE--
const numArvores = 200;
//materiais das ávores
var materialTrunk = new THREE.MeshPhongMaterial({ color: "brown" });
materialTrunk.transparent = true;
//material folha
var materialLeaves = new THREE.MeshPhongMaterial({ color: "green" });
materialLeaves.transparent = true;
var tiros = [];

// create a tree
(async () => {
  for (let i = 0; i < numArvores; i++) {
    var arvore = new Arvore(materialLeaves, materialTrunk);
    scene.add(arvore);
    arvore.rotation.y = Math.PI / 2;
    plano.plano1.add(arvore);
  }

  for (let i = 0; i < numArvores; i++) {
    var arvore = new Arvore(materialLeaves, materialTrunk);
    scene.add(arvore);
    arvore.rotation.y = Math.PI / 2;
    plano.plano2.add(arvore);
  }

  for (let i = 0; i < numArvores; i++) {
    var arvore = new Arvore(materialLeaves, materialTrunk);
    scene.add(arvore);
    arvore.rotation.y = Math.PI / 2;
    plano.plano3.add(arvore);
  }
})();

//Criando Torreta
function criaNovasTorretas(posicao) {
  for (let i = 0; i < 15; i++) {
    loadGLBFile("/T2/objeto/", "gun_turrent", true, 4.0, function (torreta) {
      torreta.position
        .setX(Math.random() * 160 - 80)
        .setZ(posicao + Math.random() * -500);

      const caixaDeColisao = new THREE.Mesh(
        new THREE.BoxGeometry(10, 10, 10),
        new THREE.MeshBasicMaterial({
          transparent: true,
          opacity: 0,
          color: "red",
        })
      );

      scene.add(caixaDeColisao);
      torreta.caixaDeColisao = caixaDeColisao;
      caixaDeColisao.position.copy(torreta.position);

      torreta.destroi = function () {
        console.log("COLIDIU");
        scene.remove(torreta);
        scene.remove(caixaDeColisao);
        torretas.filter(function (torreta, indice) {
          return indice !== torretas.length;
        });
      };

      torretas.push(torreta);
    });
  }
}

//Criando aviao
var movimentoAviao = null;
var aviaoSpeed = 0.1;
loadGLBFile("/T2/objeto/", "low-poly_airplane", true, 13.0);
let posicaoAviao = new THREE.Vector3(0, 20, 35);

//Criando mira
// Criar as miras sem preenchimento interno
const tamanhoPequeno = 1.5;
const tamanhoGrande = tamanhoPequeno * 2;
const smallSquareGeometry = new THREE.BufferGeometry().setFromPoints([
  new THREE.Vector3(-tamanhoPequeno, tamanhoPequeno, 0),
  new THREE.Vector3(tamanhoPequeno, tamanhoPequeno, 0),
  new THREE.Vector3(tamanhoPequeno, -tamanhoPequeno, 0),
  new THREE.Vector3(-tamanhoPequeno, -tamanhoPequeno, 0),
  new THREE.Vector3(-tamanhoPequeno, tamanhoPequeno, 0), // Fechar o loop
]);
const largeSquareGeometry = new THREE.BufferGeometry().setFromPoints([
  new THREE.Vector3(-tamanhoGrande, tamanhoGrande, 0),
  new THREE.Vector3(tamanhoGrande, tamanhoGrande, 0),
  new THREE.Vector3(tamanhoGrande, -tamanhoGrande, 0),
  new THREE.Vector3(-tamanhoGrande, -tamanhoGrande, 0),
  new THREE.Vector3(-tamanhoGrande, tamanhoGrande, 0), // Fechar o loop
]);
const linhaExterna1 = new THREE.BufferGeometry().setFromPoints([
  new THREE.Vector3(-tamanhoGrande, tamanhoGrande, 0),
  new THREE.Vector3(-tamanhoPequeno, tamanhoPequeno, 0),
]);
const linhaExterna2 = new THREE.BufferGeometry().setFromPoints([
  new THREE.Vector3(tamanhoGrande, tamanhoGrande, 0),
  new THREE.Vector3(tamanhoPequeno, tamanhoPequeno, 0),
]);
const linhaExterna3 = new THREE.BufferGeometry().setFromPoints([
  new THREE.Vector3(tamanhoGrande, -tamanhoGrande, 0),
  new THREE.Vector3(tamanhoPequeno, -tamanhoPequeno, 0),
]);
const linhaExterna4 = new THREE.BufferGeometry().setFromPoints([
  new THREE.Vector3(-tamanhoGrande, -tamanhoGrande, 0),
  new THREE.Vector3(-tamanhoPequeno, -tamanhoPequeno, 0),
]);
const linhaInterna1 = new THREE.BufferGeometry().setFromPoints([
  new THREE.Vector3(-tamanhoPequeno, tamanhoPequeno, 0),
  new THREE.Vector3(-tamanhoPequeno / 2, tamanhoPequeno / 2, 0),
]);
const linhaInterna2 = new THREE.BufferGeometry().setFromPoints([
  new THREE.Vector3(tamanhoPequeno, tamanhoPequeno, 0),
  new THREE.Vector3(tamanhoPequeno / 2, tamanhoPequeno / 2, 0),
]);
const linhaInterna3 = new THREE.BufferGeometry().setFromPoints([
  new THREE.Vector3(tamanhoPequeno, -tamanhoPequeno, 0),
  new THREE.Vector3(tamanhoPequeno / 2, -tamanhoPequeno / 2, 0),
]);
const linhaInterna4 = new THREE.BufferGeometry().setFromPoints([
  new THREE.Vector3(-tamanhoPequeno, -tamanhoPequeno, 0),
  new THREE.Vector3(-tamanhoPequeno / 2, -tamanhoPequeno / 2, 0),
]);

const material = new THREE.LineBasicMaterial({ color: 0x00ff00 });
const linhavertice1 = new THREE.Line(linhaExterna1, material);
const linhavertice2 = new THREE.Line(linhaExterna2, material);
const linhavertice3 = new THREE.Line(linhaExterna3, material);
const linhavertice4 = new THREE.Line(linhaExterna4, material);
const linhaverticeinterno1 = new THREE.Line(linhaInterna1, material);
const linhaverticeinterno2 = new THREE.Line(linhaInterna2, material);
const linhaverticeinterno3 = new THREE.Line(linhaInterna3, material);
const linhaverticeinterno4 = new THREE.Line(linhaInterna4, material);
const smallSquare = new THREE.Line(smallSquareGeometry, material);
const largeSquare = new THREE.Line(largeSquareGeometry, material);
largeSquare.add(linhavertice1);
largeSquare.add(linhavertice2);
largeSquare.add(linhavertice3);
largeSquare.add(linhavertice4);
smallSquare.add(linhaverticeinterno1);
smallSquare.add(linhaverticeinterno2);
smallSquare.add(linhaverticeinterno3);
smallSquare.add(linhaverticeinterno4);
smallSquare.position.set(0, 30, 0);
largeSquare.position.set(0, 30, 0);
scene.add(smallSquare);
scene.add(largeSquare);
tiros.forEach(function (tiro) {
  scene.add(tiro.object);
});

//Render
render();

var direcaoAnteriorAviao = new THREE.Vector3(0, 0, -1);

window.addEventListener("mousedown", function () {
  if (!isPaused && movimentoAviao.position && raycaster) {
    var tiro = new Tiro(movimentoAviao.position, raycaster.ray.direction);
    tiros.push(tiro);
    scene.add(tiro.object);
  }
});

function render() {
  assetManager.checkLoaded();
  requestAnimationFrame(render);
  teclado.update();

  if (!isPaused) {
    const velocidadePadrao = 1; // Velocidade padrão dos outros objetos na cena
    const proporcaoVelocidade = velocidadePadrao / aviaoSpeed;
    renderer.render(scene, camera);
    cameraHolder.position.z -= aviaoSpeed * proporcaoVelocidade;
    largeSquare.position.z -= aviaoSpeed * proporcaoVelocidade;
    smallSquare.position.z -= aviaoSpeed * proporcaoVelocidade;
    raycastPlane.position.z -= aviaoSpeed * proporcaoVelocidade;

    // desenha o plano
    let posicaoCameraX = cameraHolder.position.z;
    plano.desenhaPlano(posicaoCameraX, criaNovasTorretas);

    // Atualizar a posição das miras com base na posição do mouse
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObject(raycastPlane);

    if (intersects.length > 0) {
      const intersection = intersects[0];
      smallSquare.position.copy(intersection.point);
      const largeSquareSpeed = 1;

      const direction = intersection.point
        .clone()
        .sub(largeSquare.position)
        .normalize();
      direcaoAnteriorAviao = intersection.point
        .clone()
        .sub(
          movimentoAviao == null
            ? new THREE.Vector3(0, 0, 0)
            : movimentoAviao.position
        )
        .normalize();

      largeSquare.position.add(direction.multiplyScalar(largeSquareSpeed));
    }

    if (movimentoAviao != null) {
      const aviaoFoco = 1;

      if (
        movimentoAviao.position.x >= -window.innerWidth / 60 &&
        movimentoAviao.position.x <= window.innerWidth / 60
      ) {
        movimentoAviao.position.add(
          direcaoAnteriorAviao.multiplyScalar(aviaoFoco).setZ(0)
        );
      } else {
        if (movimentoAviao.position.x <= -window.innerWidth / 60) {
          movimentoAviao.position.setX(-window.innerWidth / 60);
        } else if (movimentoAviao.position.x >= window.innerWidth / 60) {
          movimentoAviao.position.setX(window.innerWidth / 60);
        }
      }

      movimentoAviao.position.add(
        new THREE.Vector3(0, 0, -aviaoSpeed * proporcaoVelocidade * aviaoFoco)
      );

      tiros.forEach(function (tiro) {
        tiro.anda(torretas);
      });
    }
  }
}

//ao clicar no mouse
function onRightClick(event) {
  event.preventDefault();
  //criando tiro
  if (!isPaused) {
    const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
    const sphereMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  } else {
    toggleSimulation();
  }
}

function loadGLBFile(
  modelPath,
  modelName,
  visibility,
  desiredScale,
  funcaoCarregou
) {
  var loader = new GLTFLoader();
  loader.load(modelPath + modelName + ".glb", function (gltf) {
    obj = gltf.scene;
    obj.name = modelName;
    obj.visible = visibility;
    obj.traverse(function (child) {
      if (child) {
        child.castShadow = true;
      }
    });
    obj.traverse(function (node) {
      if (node.material) node.material.side = THREE.DoubleSide;
    });

    var obj = normalizeAndRescale(obj, desiredScale);
    var obj = fixPosition(obj);
    if (obj.name == "low-poly_airplane") {
      obj.rotateY(3.13);
      obj.position.copy(posicaoAviao);
      obj.layers.set(1);
      movimentoAviao = obj;
    }
    if (obj.name == "gun_turrent") {
      obj.position.set(
        THREE.MathUtils.randFloat(-250, 250),
        3,
        THREE.MathUtils.randFloat(-150, 150)
      );
      obj.rotateY(1.57);
      obj.layers.set(2);
      obj.userData.collidable = true;
    }

    obj.receiveShadow = true;
    obj.castShadow = true;
    assetManager[modelName] = obj;
    scene.add(obj);

    if (funcaoCarregou) {
      funcaoCarregou(obj);
    }
  });
}

function toggleSimulation() {
  isPaused = !isPaused;
  isCursorVisible = !isCursorVisible;
  document.body.style.cursor = isCursorVisible ? "auto" : "none";
}

function onKeyPress(event) {
  if (event.code === "Escape") {
    toggleSimulation();
  }
  if (event.code === "Digit1") {
    aviaoSpeed = 0.1;
  }
  if (event.code === "Digit2") {
    aviaoSpeed = 0.5;
  }
  if (event.code === "Digit3") {
    aviaoSpeed = 1;
  }
}

function normalizeAndRescale(obj, newScale) {
  var scale = getMaxSize(obj);
  obj.scale.set(
    newScale * (1.0 / scale),
    newScale * (1.0 / scale),
    newScale * (1.0 / scale)
  );
  return obj;
}

function fixPosition(obj) {
  // Fix position of the object over the ground plane
  var box = new THREE.Box3().setFromObject(obj);
  if (box.min.y > 0) obj.translateY(-box.min.y);
  else obj.translateY(-1 * box.min.y);
  return obj;
}

function setDirectionalLighting(position) {
  dirLight.position.copy(position);

  // Shadow settings
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 512;
  dirLight.shadow.mapSize.height = 512;
  dirLight.shadow.camera.near = 1;
  dirLight.shadow.camera.far = 30;
  dirLight.shadow.camera.left = -15;
  dirLight.shadow.camera.right = 15;
  dirLight.shadow.camera.top = 15;
  dirLight.shadow.camera.bottom = -15;
  dirLight.name = "Direction Light";

  scene.add(dirLight);
}

// Função para obter a posição do mouse
function onMouseMove(event) {
  // Atualizar a última posição do mouse
  lastMousePosition.x = event.clientX;
  lastMousePosition.y = event.clientY;

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}
