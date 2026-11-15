/**
 *
 * @author Mil
 */

import { Orden } from '../entity/Orden.js';
import { OrdenService } from '../control/OrdenService.js';
import { BaseModel } from './BaseModel.js';

export class OrdenModel extends BaseModel {
  constructor(max = 10) {
    super({
      service: new OrdenService(),
      EntityClass: Orden,
      max,
    });
  }

  async modificar(id = this.registro?.idOrden) {
    return super.modificar(id);
  }
}