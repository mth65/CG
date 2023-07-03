import * as THREE from "three";
//import { scene } from "./T1.js";
import { createGroundPlaneWired } from "../libs/util/util.js";
export class Plano {
  plano1;
  plano2;
  constructor(cena) {
    this.plano1 = createGroundPlaneWired(1000, 200, 300, 50, 3, "green", "lightgreen");
    this.plano2 = createGroundPlaneWired(1000, 200, 300, 50, 3, "green", "lightgreen");
    this.plano2.position.set(1000, 0, 0);

    cena.add(this.plano1);
    cena.add(this.plano2);

    this.limiteCriadorDePlano = 500;
    this.alternadorDePlano = true;
    this.novaPosition = 0;
  }

  desenhaPlano(posicaoCameraX) {
    let proxPlano = 2000;

    if (posicaoCameraX > this.limiteCriadorDePlano) {
      this.limiteCriadorDePlano += 1000;

      if (this.alternadorDePlano) {
        this.novaPosition = this.plano1.position.x + proxPlano;
        this.plano1.position.set(this.novaPosition, 0, 0);
        this.alternadorDePlano = false;
      } else {
        this.novaPosition = this.plano2.position.x + proxPlano;
        this.plano2.position.set(this.novaPosition, 0, 0);
        this.alternadorDePlano = true;
      }
    }
  }

}