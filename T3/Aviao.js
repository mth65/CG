import * as THREE from "../build/three.module.js";
import { GLTFLoader } from "../build/jsm/loaders/GLTFLoader.js";
import { degreesToRadians } from "../libs/util/util.js";

export class Aviao extends THREE.Group {
  corpo;
  carregado; // garante que nao executa função antes do gltf carregar
  caixaDeColisao;

  constructor(scene) {
    super();
    this.scene = scene;
    this.carregado = false;

    let loader = new GLTFLoader();

    loader.load("./assets/objects/xwing.glb", (gltf) => this.onAirplaneLoad(scene, gltf));
    scene.add(new THREE.BoxHelper( this.corpo, 0xffff00 ))

}

onAirplaneLoad(scene, gltf) {
    //percorre o gltf e poe sombra nos nós dele
    gltf.scene.traverse( function( node ) {
        if ( node.isMesh ) { node.castShadow = true; }
        if (node.material) { node.material.side = THREE.DoubleSide; }
    } );

    this.caixaDeColisao = new THREE.Mesh(
        new THREE.BoxGeometry(50, 50, 50),
        new THREE.MeshBasicMaterial({
          transparent: false,
          opacity: 0,
          color: "red",
        })
    );

    this.corpo = gltf.scene;
    this.corpo.visible = true;
    this.corpo.castShadow = true;
    this.corpo.position.set(0,0,0);
    this.corpo.scale.set(5,5,5);
    this.corpo.rotateY(3.13);

    let posicaoAviao = new THREE.Vector3(0, 10, 35);
    this.corpo.position.copy(posicaoAviao);
    this.caixaDeColisao.position.copy(posicaoAviao);

    this.caixaDeColisao.position.set(0,20,35);
    this.corpo.layers.set(1);
    this.corpo.traverse((o)=>{
      if (o.isMesh) {
        o.material.metalness = 0.5;
      }
    })

    scene.add(this.caixaDeColisao);
    this.add(this.corpo);
    this.carregado = true;
  }

}