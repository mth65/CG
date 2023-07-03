import * as THREE from "three";
import { OrbitControls } from "../build/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "../build/jsm/loaders/GLTFLoader.js";
import { Arvore } from "./objeto/Arvore.js";
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
import Torreta from "./Torreta.js";
import { Aviao } from "./Aviao.js";

//-------------------------------------------------------------------------------
// Setagem da Scene
//-------------------------------------------------------------------------------

let scene, renderer, camera, orbit; // Initial variables
let isPaused = false;
let isCursorVisible = false;
document.body.style.cursor = "none";
scene = new THREE.Scene(); // Create main scene
renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//-------------------------------------------------------------------------------
// Camera
//-------------------------------------------------------------------------------

let camPos = new THREE.Vector3(0.0, 0.0, 0.0);
let camUp = new THREE.Vector3(0.0, 1.0, 0.0);
camera = new THREE.PerspectiveCamera(
  65,
  window.innerWidth / window.innerHeight,
  0.1,
  5000
);
camera.position.copy(camPos);
camera.up.copy(camUp);
let cameraHolder = new THREE.Object3D();
cameraHolder.add(camera);
cameraHolder.position.set(0.0, 90.0, 100.0);
scene.add(cameraHolder);
cameraHolder.rotateX(-Math.PI / 8);

//-------------------------------------------------------------------------------
// Imports dos Sons e Musicas
//-------------------------------------------------------------------------------

var audioListener = new THREE.AudioListener();
camera.add(audioListener);
const audioLoader = new THREE.AudioLoader();

const airplaneSound = new THREE.Audio(audioListener);
audioLoader.load("assets/sounds/shoot.mp3", function (buffer) {
  airplaneSound.setBuffer(buffer);
  airplaneSound.setVolume(0.1);
});
const explosionSound = new THREE.Audio(audioListener);
audioLoader.load("assets/sounds/explosion.mp3", function (buffer) {
  explosionSound.setBuffer(buffer);
  explosionSound.setVolume(0.1);
});
const vaderMusic = new THREE.Audio(audioListener);
audioLoader.load("assets/sounds/darthvader.mp3", function (buffer) {
  vaderMusic.setBuffer(buffer);
  vaderMusic.setVolume(0.1);
});


//-------------------------------------------------------------------------------
// Luz
//-------------------------------------------------------------------------------

const ambientColor = "rgb(50,50,50)";
let ambientLight = new THREE.AmbientLight(ambientColor);
scene.add(ambientLight);
let lightPosition = new THREE.Vector3(10, 15, 0);
let lightColor = "rgb(255,255,255)";
let dirLight = new THREE.DirectionalLight(lightColor);
setDirectionalLighting(lightPosition);

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


//-------------------------------------------------------------------------------
// Skybox
//-------------------------------------------------------------------------------

let skyboxMesh;
function loadSkybox() {
  const skyboxTextures = ["bk", "dn", "ft", "lf", "rt", "up"];

  let materials = skyboxTextures
    .map(function (texture) {
      return new THREE.TextureLoader().load(
        `assets/skybox/redeclipse_${texture}.png`,
        () => console.log("CARREGOU PORRA"),
        undefined,
        () => console.error("FUDEU")
      );
    })
    .map(function (texture) {
      return new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.BackSide,
      });
    });

  let skyboxCube = new THREE.BoxGeometry(4000, 4000, 4000);
  skyboxMesh = new THREE.Mesh(skyboxCube, materials);
  scene.add(skyboxMesh);
}
loadSkybox();

//-------------------------------------------------------------------------------
// Event Listeners (Controles)
//-------------------------------------------------------------------------------


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
window.addEventListener("mousedown", onMouseDown, false);

// Função para obter a posição do mouse
function onMouseMove(event) {
  // Atualizar a última posição do mouse
  lastMousePosition.x = event.clientX;
  lastMousePosition.y = event.clientY;

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
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

function toggleSimulation() {
  isPaused = !isPaused;
  isCursorVisible = !isCursorVisible;
  document.body.style.cursor = isCursorVisible ? "auto" : "none";
}

function toggleMusic(){
  console.log("entrou na func");
  if(!vaderMusic.isPlaying){
    console.log("isplaying");
    if (vaderMusic.buffer) {
      console.log("buffering");
      vaderMusic.play();
    }
  }
  else{
    console.log("stop music");
    vaderMusic.stop();
  }
}

function onKeyPress(event) {
  if (event.code === "Escape") {
    toggleSimulation();
  }
  if (event.code === "KeyS"){
    toggleMusic();
  }
}

function onMouseDown(event) {
  if (!isPaused && movimentoAviao.position && raycaster) {
    var tiro = new Tiro(
      movimentoAviao.position,
      raycaster.ray.direction,
      explosionSound
    );
    tiros.push(tiro);
    scene.add(tiro.object);

    if (airplaneSound.buffer) {
      airplaneSound.stop();
      airplaneSound.play();
    }
  }
}
//-------------------------------------------------------------------------------
// Cria o Raycaster
//-------------------------------------------------------------------------------

// Variáveis para armazenar a posição do mouse
const mouse = new THREE.Vector2();
var lastMousePosition = new THREE.Vector2(); // Última posição do mouse

// Plano do Raycaster
const raycaster = new THREE.Raycaster();
var planeGeometry = new THREE.PlaneGeometry(150, 100);
var planeMaterial = new THREE.MeshBasicMaterial({ visible: false });
var raycastPlane = new THREE.Mesh(planeGeometry, planeMaterial);
raycastPlane.translateY(50);
raycastPlane.translateX(-2.8);
scene.add(raycastPlane);

// Criando as miras
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

//-------------------------------------------------------------------------------
// Assets Manager
//-------------------------------------------------------------------------------

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


//-------------------------------------------------------------------------------
// loadGLB
//-------------------------------------------------------------------------------

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

//-------------------------------------------------------------------------------
// Aviao, Torretas e Tiros
//-------------------------------------------------------------------------------

var plano = new Plano(scene);

// Criando aviao
var movimentoAviao = new Aviao(scene);
scene.add(movimentoAviao);
movimentoAviao.visible = true;

var aviaoSpeed = 0.1;
var direcaoAnteriorAviao = new THREE.Vector3(0, 0, -1);




// var playerboxSetada = false;


// Criando Torreta
function criaNovasTorretas(posicao) {
  for (let i = 0; i < 3; i++) {
    let indice = torretas.length;
    torretas.push(
      new Torreta(posicao, scene, function () {
        torretas.splice(indice, 1);
      })
    );
  }
}
let torretas = [];
criaNovasTorretas(0);
criaNovasTorretas(-500);
criaNovasTorretas(-1000);

// Criando tiros
var tiros = [];
tiros.forEach(function (tiro) {
  scene.add(tiro.object);
});







//--ARVORE--
const numArvores = 200;
//materiais das ávores
var materialTrunk = new THREE.MeshPhongMaterial({ color: "brown" });
materialTrunk.transparent = true;
//material folha
var materialLeaves = new THREE.MeshPhongMaterial({ color: "green" });
materialLeaves.transparent = true;




//Render
var musicLoaded = false;
render();




function render() {
  assetManager.checkLoaded();
  requestAnimationFrame(render);

  if (!musicLoaded){
    if(vaderMusic.buffer){
      vaderMusic.play();
      musicLoaded = true;
    }
  }
  if (!isPaused) {
    const velocidadePadrao = 1; // Velocidade padrão dos outros objetos na cena
    const proporcaoVelocidade = velocidadePadrao / aviaoSpeed;
    renderer.render(scene, camera);
    cameraHolder.position.z -= aviaoSpeed * proporcaoVelocidade;
    largeSquare.position.z -= aviaoSpeed * proporcaoVelocidade;
    smallSquare.position.z -= aviaoSpeed * proporcaoVelocidade;
    raycastPlane.position.z -= aviaoSpeed * proporcaoVelocidade;
    skyboxMesh.position.z -= aviaoSpeed * proporcaoVelocidade;
    skyboxMesh.rotateX(0.00005);
    skyboxMesh.rotateY(0.00005);

    // desenha o plano
    let posicaoCameraX = cameraHolder.position.z;
    plano.desenhaPlano(posicaoCameraX, criaNovasTorretas);

    torretas.forEach((torreta) => torreta.update(movimentoAviao));

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

      if (largeSquare.position.distanceTo(smallSquare.position) >= 0.5) {
        largeSquare.position.add(direction.multiplyScalar(largeSquareSpeed));
      }
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


function verificaColisao(pos1, bound1, pos2, bound2) {
  function verificaColisaoPonto(x1min, x1max, x2min, x2max) {
    return (
      (x1min >= x2min && x1min <= x2max) || (x1max >= x2min && x1max <= x2max)
    );
  }

  function verificaColisaoEixo(eixo) {
    return verificaColisaoPonto(
      pos1.position[eixo] + bound1.min[eixo],
      pos1.position[eixo] + bound1.max[eixo],
      pos2.position[eixo] + bound2.min[eixo],
      pos2.position[eixo] + bound2.max[eixo]
    );
  }

  return (
    verificaColisaoEixo("x") &&
    verificaColisaoEixo("y") &&
    verificaColisaoEixo("z")
  );
}

export { loadGLBFile, verificaColisao };
