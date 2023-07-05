import * as THREE from "three";
import { loadGLBFile } from "./LoaderGLB.js";

export class Torreta {
  constructor(posicao, scene, removeDaLista) {
    this.scene = scene;
    this.removeDaLista = removeDaLista;
    // Inicia atirando ou nao para nao comecar todas atirando juntas
    this.atirando = Math.round(Math.random()) === 0 ? false : true;
    this.cadencia = 2;
    // Se iniciar atirando, coloca um tempo de carregamento aleatorio que vai até a cadencia
    this.recarregando = this.atirando ? Math.random() * this.cadencia : 0;
    this.tiros = [];

    loadGLBFile(
      this.scene,
      "./objeto/",
      "gun_turrent",
      true,
      20.0,
      (torreta) => {
        this.torreta = torreta;

        this.torreta.position
          .setX(Math.random() * 160 - 80)
          .setZ(posicao + Math.random() * -400);

        this.caixaDeColisao = new THREE.Mesh(
          new THREE.BoxGeometry(20, 20, 20),
          new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0,
            color: "red",
          })
        );

        scene.add(this.caixaDeColisao);
        this.torreta.caixaDeColisao = this.caixaDeColisao;
        this.caixaDeColisao.position.copy(torreta.position);
        this.caixaDeColisao.position.add(new THREE.Vector3(14, 0, 7));
        // scene.add(new THREE.BoxHelper( this.torreta, 0xffff00 ))
      }
    );
  }

  destroi() {
    setTimeout(() => {
      this.tiros.forEach((tiro) => {
        this.scene.remove(tiro);
      }, 500);
    });

    this.scene.remove(this.torreta);
    this.scene.remove(this.caixaDeColisao);

    this.tiros = [];

    this.removeDaLista();
  }

  atira(aviao, torretaSound) {
    if (this.atirando) {
      return;
    }

    this.atirando = true;

    var tiro = new THREE.SphereGeometry(1);
    var tiroMaterial = new THREE.MeshStandardMaterial({
      color: "green",
    });
    var tiroMesh = new THREE.Mesh(tiro, tiroMaterial);
    tiroMesh.position.copy(this.torreta.position);
    tiroMesh.lookAt(aviao.position);

    this.scene.add(tiroMesh);
    this.tiros.push(tiroMesh);
    if (torretaSound.buffer) {
      //console.log("buffering");
      torretaSound.play();
    }
  }

  update(movimentoAviao, torretaSound) {
    if (!this.torreta) {
      return;
    }

    if (this.atirando) {
      this.recarregando += 0.01;

      if (this.recarregando >= this.cadencia) {
        this.atirando = false;
        this.recarregando = 0;
      }
    }

    if (movimentoAviao) {
      if (
        this.torreta.position.distanceTo(movimentoAviao.position) < 450 &&
        movimentoAviao.position.z > this.torreta.position.z
      ) {
        this.atira(movimentoAviao, torretaSound);
      }
    }

    this.tiros.forEach(function (tiro) {
      tiro.translateZ(3);
    });
  }
}

export default Torreta;
