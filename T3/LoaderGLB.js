import * as THREE from "three";
import { GLTFLoader } from "../build/jsm/loaders/GLTFLoader.js";
import {
    getMaxSize,
} from "../libs/util/util.js";
import { assetManager } from "./AssetManager.js";

export function loadGLBFile(
    scene,
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
    assetManager.checkLoaded();
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
