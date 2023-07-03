import * as THREE from 'three';

export class Arvore extends THREE.Group{
    constructor(materialfolha, materialtronco) {
        super();
        // create a tree
        var trunk = new THREE.CylinderGeometry(0.6, 0.6, 3);//medidas do tronco
        var leaves = new THREE.ConeGeometry(1.5, 1.5);//medida das camadas da arvore
        var leaves2 = new THREE.ConeGeometry(2, 2);//medida das camadas da arvore
        var leaves3 = new THREE.ConeGeometry(2.5, 2.5);//medida das camadas da arvore

        // create the mesh
        var trunkMesh = new THREE.Mesh(trunk, materialtronco);//mesh do tronco

        var leavesMesh = new THREE.Mesh(leaves, materialfolha);//mesh da 1 camada

        var leaves2Mesh = new THREE.Mesh(leaves2, materialfolha);//mesh da 2 camada

        var leaves3Mesh = new THREE.Mesh(leaves3, materialfolha);//mesh da 3 camada

        // position the trunk. Set y to half of height of trunk
        trunkMesh.position.set(THREE.MathUtils.randFloat(-499, 499), 1.5, THREE.MathUtils.randFloat(-99, 99));//posição do tronco
        leavesMesh.position.set(0, 4, 0);//posição em relação ao tronco da 1 camada
        leaves2Mesh.position.set(0, 3, 0);//posição em relação ao tronco da 2 camada
        leaves3Mesh.position.set(0, 2, 0);//posição em relação ao tronco da 3 camada

        trunkMesh.castShadow = true;//sombra do tronco
        trunkMesh.receiveShadow = true;
        leavesMesh.castShadow = true;//sombra da 1 camada
        leavesMesh.receiveShadow = true;
        leaves2Mesh.castShadow = true;//sombra da 2 camada
        leaves2Mesh.receiveShadow = true;
        leaves3Mesh.castShadow = true;//sombra da 3 camada
        leaves3Mesh.receiveShadow = true;

        trunkMesh.add(leavesMesh);//adiciona no tronco a 1 camada
        trunkMesh.add(leaves2Mesh);//adiciona a segunda camada ao tronco
        trunkMesh.add(leaves3Mesh);//adiciona a terceira camada ao tronco

        this.add(trunkMesh);
    }

}
