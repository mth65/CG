import * as THREE from "three";
import { setDefaultMaterial } from "../libs/util/util.js";

class Aviao extends THREE.Group {
  //INICIO
  constructor(scene) {
    super();
    //angulos
    var angle90 = THREE.MathUtils.degToRad(90); //cria o angulo 90º

    // criando o avião
    var base = new THREE.CylinderGeometry(1.5, 1, 12); //cria base
    base.rotateZ(-angle90); //rotacinando o cilindro em 90°

    var janela = new THREE.CapsuleGeometry(1, 1, 20, 25); //cria janela
    janela.rotateZ(-angle90); //rotacinando a janela em 90°

    var circulo = new THREE.CircleGeometry(1, 32); //circulo preto da frente do avião
    circulo.rotateY(angle90); //rotacinando  em 90°

    var cilindro = new THREE.CylinderGeometry(0.2, 0.2, 2); //cilindro que gira da frente do avião
    cilindro.rotateZ(angle90);

    var helice = new THREE.PlaneGeometry(5, 0.5); //helice do avião
    helice.rotateY(-angle90);

    var asaLateralMaior = new THREE.CapsuleGeometry(1.5, 14, 30, 2); //asa maior que fica na lateral
    asaLateralMaior.rotateX(-angle90);
    asaLateralMaior.rotateZ(-angle90);

    var asaLateralMenor = new THREE.CapsuleGeometry(1, 6, 15, 2); // asa menor que fica mais atras do aviao
    asaLateralMenor.rotateX(-angle90);
    asaLateralMenor.rotateZ(-angle90);

    var asinha = new THREE.CapsuleGeometry(0.5, 2, 30, 2); //asa que fica por cima

    //Mesh's
    var baseMesh = new THREE.Mesh(base, setDefaultMaterial("gray"));
    baseMesh.position.set(-150, 15, 0);

    var janelaMesh = new THREE.Mesh(janela, setDefaultMaterial("blue"));
    janelaMesh.position.set(3, 1, 0);

    var circuloMesh = new THREE.Mesh(circulo, setDefaultMaterial("black"));
    circuloMesh.position.set(6.01, 0, 0);

    var cilindroMesh = new THREE.Mesh(cilindro, setDefaultMaterial("black"));
    cilindroMesh.position.set(6.01, 0, 0);

    var heliceMesh = new THREE.Mesh(
      helice,
      setDefaultMaterial("yellow", THREE.DoubleSide)
    );
    heliceMesh.position.set(0.98, 0, 0);

    var asaLateralMaiorMesh = new THREE.Mesh(
      asaLateralMaior,
      setDefaultMaterial("gray")
    );
    asaLateralMaiorMesh.position.set(2, 0, 0);

    var asaLateralMenorMesh = new THREE.Mesh(
      asaLateralMenor,
      setDefaultMaterial("gray")
    );
    asaLateralMenorMesh.position.set(-5, 0, 0);

    var asinhaMesh = new THREE.Mesh(asinha, setDefaultMaterial("gray"));
    asinhaMesh.position.set(-5.5, 1, 0);

    scene.add(baseMesh);
    baseMesh.add(janelaMesh);
    baseMesh.add(circuloMesh);
    baseMesh.add(cilindroMesh);
    baseMesh.add(asaLateralMaiorMesh);
    baseMesh.add(asaLateralMenorMesh);
    baseMesh.add(asinhaMesh);
    cilindroMesh.add(heliceMesh);

    this.rotateCylinder = function (delta) {
      var speed = 1.2;
      var animationOn = true; // control if animation is on or of
      if (animationOn) {
        cilindroMesh.rotation.x += speed; //girando o cilindro pois a helice esta nele e irá girar junto
      }
    };
  }
}
export { Aviao };
