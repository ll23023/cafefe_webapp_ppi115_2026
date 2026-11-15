/**
 *
 * @author Mil
 */

import { Factura } from '../entity/Factura.js';
import { FacturaService } from '../control/FacturaService.js';
import { BaseModel } from './BaseModel.js';

export class FacturaModel extends BaseModel {
  constructor(max = 10) {
    super({
      service: new FacturaService(),
      EntityClass: Factura,
      max,
    });
  }

  async modificar(id = this.registro?.idFactura) {
    return super.modificar(id);
  }
}