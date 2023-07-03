import * as THREE from "three";

export class Plano {
  plano1;
  plano2;
  plano3;
  plano4;
  plano5;
  constructor(scena) {
    this.plano1 = createPlane();
    this.plano2 = createPlane();
    this.plano3 = createPlane();
    this.plano4 = createPlane();
    this.plano5 = createPlane();

    this.plano2.position.set(0, 0, -300);
    this.plano3.position.set(0, 0, -600);
    this.plano4.position.set(0, 0, -900);
    this.plano5.position.set(0, 0, -1200);

    scena.add(this.plano1);
    scena.add(this.plano2);
    scena.add(this.plano3);
    scena.add(this.plano4);
    scena.add(this.plano5);

    this.limiteCriadorDePlano = -300;
    this.alternadorDePlano = 0;
    this.novaPosition = 0;
  }

  desenhaPlano(posicaoCameraX, criaNovasTorretas) {
    let proxPlano = -1500;

    if (posicaoCameraX < this.limiteCriadorDePlano) {
      this.limiteCriadorDePlano -= 300;

      if (this.alternadorDePlano === 0) {
        this.novaPosition = this.plano1.position.z + proxPlano;
        console.log("CRIANDO PLANO 1", this.plano1.position.z);

        this.plano1.position.set(0, 0, this.novaPosition);
        this.alternadorDePlano = 1;
      } else if (this.alternadorDePlano === 1) {
        console.log("CRIANDO PLANO 2", this.plano2.position.z);
        this.novaPosition = this.plano2.position.z + proxPlano;
        this.plano2.position.set(0, 0, this.novaPosition);
        this.alternadorDePlano = 2;
      } else if (this.alternadorDePlano === 2) {
        console.log("CRIANDO PLANO 3", this.plano3.position.z);
        this.novaPosition = this.plano3.position.z + proxPlano;
        this.plano3.position.set(0, 0, this.novaPosition);
        this.alternadorDePlano = 3;
      } else if (this.alternadorDePlano === 3) {
        console.log("CRIANDO PLANO 4", this.plano4.position.z);
        this.novaPosition = this.plano4.position.z + proxPlano;
        this.plano4.position.set(0, 0, this.novaPosition);
        this.alternadorDePlano = 4;
      } else {
        console.log("CRIANDO PLANO 5", this.plano5.position.z);
        this.novaPosition = this.plano5.position.z + proxPlano;
        this.plano5.position.set(0, 0, this.novaPosition);
        this.alternadorDePlano = 0;
      }

      console.log(this.novaPosition);
      criaNovasTorretas(this.novaPosition);
    }
  }
}

function createPlane() {
  //Texturas
  const loader = new THREE.TextureLoader();
  const walltexture = loader.load( 'assets/textures/cyberOrange.png' );
  walltexture.wrapS = walltexture.wrapT = THREE.RepeatWrapping;
  walltexture.repeat.set( 5, 5 );

  const detalheTexture = loader.load( 'assets/textures/cyberBlue.png' );
  detalheTexture.wrapS = detalheTexture.wrapT = THREE.RepeatWrapping;
  detalheTexture.repeat.set( 5, 5 );

  var wallMaterial = new THREE.MeshPhongMaterial( { map: walltexture, emissive: "#FF0000", emissiveIntensity: 0.1   });
  var detalheMaterial = new THREE.MeshPhongMaterial( { map: detalheTexture});

  const materialPlano = wallMaterial;
  const materialLinha = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    wireframe: true,
  });

  //largura do plano 300
  //tamanho do plano 500
  const planoGeometry = new THREE.BoxGeometry(300, 0, 300);
  const plano = new THREE.Mesh(planoGeometry, materialPlano);

  const lateralGeometry = new THREE.BoxGeometry(100, 100, 300);
  const lateralEsq = new THREE.Mesh(lateralGeometry, materialPlano);
  const lateralDir = new THREE.Mesh(lateralGeometry, materialPlano);

  //const linePlano = new THREE.Mesh(planoGeometry, materialLinha);
  //const lineLateralEsq = new THREE.Mesh(lateralGeometry, materialLinha);
  //const lineLateralDir = new THREE.Mesh(lateralGeometry, materialLinha);

  const cuboGeometria = new THREE.BoxGeometry( 25, 25, 25 );
  const sphereGeometria = new THREE.SphereGeometry(10,32,32);
  const coneGeometria = new THREE.ConeGeometry( 16, 50, 32 );
  const cilinderGeometria = new THREE.CylinderGeometry( 10, 10, 100, 32 );

  const detalheCubo = new THREE.Mesh(cuboGeometria, detalheMaterial );
  const detalheCubo2 = new THREE.Mesh(cuboGeometria, detalheMaterial );
  const detalheCubo3 = new THREE.Mesh(cuboGeometria, detalheMaterial );
  const detalheEsfera = new THREE.Mesh(sphereGeometria, detalheMaterial );
  const detalheEsfera2 = new THREE.Mesh(sphereGeometria, detalheMaterial );
  const detalheEsfera3 = new THREE.Mesh(sphereGeometria, detalheMaterial );
  const detalheCone = new THREE.Mesh(coneGeometria, detalheMaterial );
  const detalheCone2 = new THREE.Mesh(coneGeometria, detalheMaterial );
  const detalheCilindro = new THREE.Mesh(cilinderGeometria, detalheMaterial );
  const detalheCilindro2 = new THREE.Mesh(cilinderGeometria, detalheMaterial );


  plano.position.set(0, 0, 0);

  lateralEsq.position.set(-150, 50, 0);
  detalheCubo.position.set(50, 0, 50);
  detalheCubo2.position.set(20, 80, 0);
  detalheCubo3.position.set(40, -30, -30);
  detalheCilindro.position.set(20,50,0)
  detalheEsfera3.position.set(50, 30, -70);
  lateralEsq.add(detalheCubo);
  lateralEsq.add(detalheCubo2);
  lateralEsq.add(detalheCubo3);
  lateralEsq.add(detalheCilindro);
  lateralEsq.add(detalheEsfera3);

  lateralDir.position.set(150, 50, 0);
  detalheEsfera.position.set(-50, 0, 0);
  detalheEsfera2.position.set(-50, 30, 75);
  detalheCone.position.set(-20,50,30)
  detalheCone2.rotateZ(1.7);
  detalheCone2.position.set(-50,-20,60)
  detalheCilindro2.rotateZ(1.6);
  detalheCilindro2.position.set(-20,30,-70)
  lateralDir.add(detalheEsfera);
  lateralDir.add(detalheCone);  
  lateralDir.add(detalheEsfera2);
  lateralDir.add(detalheCone2);
  lateralDir.add(detalheCilindro2);

  //plano.add(linePlano);
  plano.add(lateralEsq);
  plano.add(lateralDir);

  //lateralEsq.add(lineLateralEsq);
  //  lateralDir.add(lineLateralDir);

  return plano;
}
