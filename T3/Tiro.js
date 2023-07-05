import * as THREE from "three";

export class Tiro {
  constructor(posicao, direcao, sound) {
    this.px = posicao.x;
    this.py = posicao.y;
    this.pz = posicao.z;
    this.sound = sound;

    this.object = new THREE.Mesh(
      new THREE.SphereGeometry(0.8),
      new THREE.MeshStandardMaterial({
        color: "red",
      })
    );

    this.object.position.set(this.px, this.py, this.pz);
    this.direcao = new THREE.Vector3().copy(direcao).multiplyScalar(10);
    direcao.setComponent(1, direcao.getComponent(1) + 0.02);
    //console.log(direcao)
  }

  verificaColisao(min1, min2, max1, max2) {
    if ((min1 >= min2 && min1 <= max1) || (min1 <= min2 && max1 >= min2)) {
      return true;
    }

    return false;
  }

  anda(torretas) {
    this.object.position.add(this.direcao);

    torretas.forEach((torreta) => {
      if (!this.object.geometry.boundingBox) {
        this.object.geometry.computeBoundingBox();
      }

      var torretaMesh = torreta.caixaDeColisao;

      if (!torretaMesh) {
        return;
      }

      if (!torretaMesh.geometry.boundingBox) {
        torretaMesh.geometry.computeBoundingBox();
      }

      const caixaTiro = this.object.geometry.boundingBox;
      const caixaTorreta = torretaMesh.geometry.boundingBox;

      if (
        ((this.object.position.x + caixaTiro.min.x >=
          torretaMesh.position.x + caixaTorreta.min.x &&
          this.object.position.x + caixaTiro.min.x <=
            torretaMesh.position.x + caixaTorreta.max.x) ||
          (this.object.position.x + caixaTiro.max.x >=
            torretaMesh.position.x + caixaTorreta.min.x &&
            this.object.position.x + caixaTiro.max.x <=
              torretaMesh.position.x + caixaTorreta.min.x)) &&
        ((this.object.position.y + caixaTiro.min.y >=
          torretaMesh.position.y + caixaTorreta.min.y &&
          this.object.position.y + caixaTiro.min.y <=
            torretaMesh.position.y + caixaTorreta.max.y) ||
          (this.object.position.y + caixaTiro.max.y >=
            torretaMesh.position.y + caixaTorreta.min.y &&
            this.object.position.y + caixaTiro.max.y <=
              torretaMesh.position.y + caixaTorreta.min.y)) &&
        ((this.object.position.z + caixaTiro.min.z >=
          torretaMesh.position.z + caixaTorreta.min.z &&
          this.object.position.z + caixaTiro.min.z <=
            torretaMesh.position.z + caixaTorreta.max.z) ||
          (this.object.position.z + caixaTiro.max.z >=
            torretaMesh.position.z + caixaTorreta.min.z &&
            this.object.position.z + caixaTiro.max.z <=
              torretaMesh.position.z + caixaTorreta.min.z))
      ) {
        torreta.destroi();
        if (this.sound && this.sound.buffer) {
          this.sound.stop();
          this.sound.play();
        }
      }
    });
  }
}
