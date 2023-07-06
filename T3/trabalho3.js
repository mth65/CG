import * as THREE from "three";
import { Plano } from "./Plano.js";
import { onWindowResize } from "../libs/util/util.js";
import { loadGLBFile } from "./LoaderGLB.js";
import { Tiro } from "./Tiro.js";
import { Torreta } from "./Torreta.js";
import { Aviao } from "./Aviao.js";
import { Vector3 } from "../build/three.module.js";
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
renderer.shadowMap.enabled = true;
renderer.shadowMapSoft = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;


//-------------------------------------------------------------------------------
// Camera
//-------------------------------------------------------------------------------

let camPos = new THREE.Vector3(0.0, 0.0, 0.0);
let camUp = new THREE.Vector3(0.0, 1.0, 0.0);
camera = new THREE.PerspectiveCamera(
  65,
  window.innerWidth / window.innerHeight,
  0.1,
  10000
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

const torretaSound = new THREE.Audio(audioListener);
audioLoader.load("assets/sounds/shoot.mp3", function (buffer) {
  console.log("torreta atirou");
  torretaSound.setBuffer(buffer);
  torretaSound.setVolume(0.1);
});
const airplaneSound = new THREE.Audio(audioListener);
audioLoader.load("assets/sounds/shoot2.mp3", function (buffer) {
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

const ambientColor = "rgb(100,100,100)";
let ambientLight = new THREE.AmbientLight(ambientColor);
ambientLight.castShadow = false;
scene.add(ambientLight);
let lightPosition = new THREE.Vector3(30, 50, 50);
let lightColor = "rgb(255,255,255)";
let dirLight = new THREE.DirectionalLight(lightColor);
setDirectionalLighting(lightPosition);

function setDirectionalLighting(position) {
  dirLight.position.copy(position);

  // Shadow settings
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;
  dirLight.shadow.camera.near = 1;
  dirLight.shadow.camera.far = 10000;
  dirLight.shadow.camera.left = -500;
  dirLight.shadow.camera.right = 500;
  dirLight.shadow.camera.top = 500;
  dirLight.shadow.camera.bottom = -500;
  dirLight.intensity = 1.5;
  dirLight.name = "Direction Light";
  const helper = new THREE.DirectionalLightHelper( dirLight, 5 );
  dirLight.add( helper );
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

  let skyboxCube = new THREE.BoxGeometry(15000, 15000, 15000);
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
  lastMousePosition.x = mouse.x;
  lastMousePosition.y = mouse.y;

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  angulaAviao(lastMousePosition, mouse);
}

function angulaAviao(lastMousePosition, mouse) {
  if(lastMousePosition.x > mouse.x) {if(movimentoAviao.rotation.z <= 0.3){ movimentoAviao.rotateZ(0.005); }}
  else if(lastMousePosition.x < mouse.x) {if(movimentoAviao.rotation.z >= -0.3){ movimentoAviao.rotateZ(-0.005); }}
  if(lastMousePosition.y < mouse.y)  {if(movimentoAviao.rotation.x <= 0.3){ movimentoAviao.rotateX(0.005); }}
  else if(lastMousePosition.y > mouse.y) {if(movimentoAviao.rotation.x >= -0.3){ movimentoAviao.rotateX(-0.005); }}
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

let velocidade2x = false;
let velocidade5x = false;
function toggleVelocidade(speed) {
  switch (speed) {
    case 1:
      velocidade2x = false;
      velocidade5x = false;
      break;
    case 2:
      velocidade5x = false;
      velocidade2x = true;
      break;
    case 3:
      velocidade5x = true;
      break;
  }

  isCursorVisible = !isCursorVisible;
  document.body.style.cursor = isCursorVisible ? "auto" : "none";
}

function toggleMusic() {
  console.log("entrou na func");
  if (!vaderMusic.isPlaying) {
    console.log("isplaying");
    if (vaderMusic.buffer) {
      console.log("buffering");
      vaderMusic.play();
    }
  } else {
    console.log("stop music");
    vaderMusic.stop();
  }
}

function onKeyPress(event) {
  if (event.code === "Escape") {
    toggleSimulation();
  }
  if (event.code === "KeyS") {
    toggleMusic();
  }
  if (event.code === "Digit1") {
    toggleVelocidade(1);
  }
  if (event.code === "Digit2") {
    toggleVelocidade(2);
  }
  if (event.code === "Digit3") {
    toggleVelocidade(3);
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
// Aviao, Torretas e Tiros
//-------------------------------------------------------------------------------

var plano = new Plano(scene);

// Criando aviao
var movimentoAviao = new Aviao(scene);
scene.add(movimentoAviao);
movimentoAviao.visible = true;

var aviaoSpeed = 0.1;
var direcaoAnteriorAviao = new THREE.Vector3(0, 0, -1);

// Criando Torreta
let torretas = [];
function criaNovasTorretas(posicao) {
  for (let i = 0; i < 3; i++) {
    let indice = torretas.length;
    let torreta = new Torreta(posicao, scene, function () {
      torretas.splice(indice, 1);
    });
    console.log(torreta);
    torretas.push(torreta);
  }
}
criaNovasTorretas(0);
criaNovasTorretas(-500);
criaNovasTorretas(-1000);
criaNovasTorretas(-1500);
criaNovasTorretas(-2000);

// Criando tiros
var tiros = [];
tiros.forEach(function (tiro) {
  scene.add(tiro.object);
});

//-------------------------------------------------------------------------------
// Render
//-------------------------------------------------------------------------------

//Render
var musicLoaded = false;
render();

function render() {
  // assetManager.checkLoaded();
  requestAnimationFrame(render);
  funcaoFade();

  movimentoAviao.defaultMove();
  if (!musicLoaded) {
    if (vaderMusic.buffer) {
      vaderMusic.play();
      musicLoaded = true;
    }
  }
  if (!isPaused) {
    const velocidadePadrao = 1; // Velocidade padrão dos outros objetos na cena
    let proporcaoVelocidade = velocidadePadrao / aviaoSpeed;
    if (velocidade5x) {
      proporcaoVelocidade = 5 * proporcaoVelocidade;
    } else if (velocidade2x) {
      proporcaoVelocidade = 2 * proporcaoVelocidade;
    }
    //console.log(proporcaoVelocidade);
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

    torretas.forEach((torreta) => torreta.update(movimentoAviao, torretaSound));

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
        movimentoAviao.position.x >= -window.innerWidth / 40 &&
        movimentoAviao.position.x <= window.innerWidth / 40
      ) {
        movimentoAviao.position.add(
          direcaoAnteriorAviao.multiplyScalar(0.3).setZ(0)
        );
      } else {
        if (movimentoAviao.position.x <= -window.innerWidth / 40) {
          movimentoAviao.position.setX(-window.innerWidth / 40);
        } else if (movimentoAviao.position.x >= window.innerWidth / 40) {
          movimentoAviao.position.setX(window.innerWidth / 40);
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

function funcaoFade(){
  scene.traverse( function( node ) {
    if ( node instanceof THREE.Mesh ) {
      if ( node.isMesh ) { node.castShadow = true;      node.receiveShadow = true;
      }
      if (node.material) { node.material.side = THREE.DoubleSide; }
    }
  } );
}

//-------------------------------------------------------------------------------
// Função de Colisão
//-------------------------------------------------------------------------------

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
