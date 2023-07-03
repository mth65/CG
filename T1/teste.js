// Importação das bibliotecas necessárias
import * as THREE from 'three';

// Inicialização da cena, câmera e renderizador
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Criação do avião
var geometry = new THREE.BoxGeometry(5, 1, 1);
var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
var plane = new THREE.Mesh(geometry, material);
plane.position.z = -10;
scene.add(plane);

// Define a distância da câmera em relação ao avião
var cameraDistance = 50;

// Movimentação do avião
var planeMoveSpeed = 0.1;
var planeLateralSpeed = 0.1;
var planeLateralTarget = 0;
var planeLateral = 0;

// Raycaster para pegar a posição do mouse no plano vertical
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

// Adiciona evento de movimentação do mouse
document.addEventListener('mousemove', onMouseMove, false);

// Função que atualiza a posição do avião e da câmera
function update() {
  // Movimenta o avião para a frente
  plane.position.z += planeMoveSpeed;

  // Movimenta o avião lateralmente com lerp e delay
  planeLateral = THREE.Math.lerp(planeLateral, planeLateralTarget, planeLateralSpeed);
  plane.position.x = planeLateral;

  // Atualiza a posição da câmera
  var cameraFrontVector = new THREE.Vector3(0, 0, -1);
  cameraFrontVector.applyQuaternion(plane.quaternion);
  var cameraPosition = new THREE.Vector3();
  cameraPosition.copy(plane.position).add(cameraFrontVector.multiplyScalar(cameraDistance));
  camera.position.copy(cameraPosition);
  camera.lookAt(plane.position);
}

// Função de animação que chama a função update e renderiza a cena
function animate() {
  requestAnimationFrame(animate);
  update();
  renderer.render(scene, camera);
}

animate();

// Função para atualizar a posição do avião com base na posição do mouse
function onMouseMove(event) {
  // Calcula a posição normalizada do mouse (-1 a 1)
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Lança um raio a partir da posição do mouse e pega a posição no plano z = 0
  raycaster.setFromCamera(mouse, camera);
  var intersects = raycaster.intersectObjects(scene.children);
  if (intersects.length > 0) {
    var intersection = intersects[0].point;
    planeLateralTarget = intersection.x;
  }
}

