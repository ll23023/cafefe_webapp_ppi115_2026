/**
 *
 * @author Mil
 */

import { Pago } from '../entity/Pago.js';
import { PagoService } from '../control/PagoService.js';
import { BaseModel } from './BaseModel.js';

export class PagoModel extends BaseModel {
  constructor(max = 10) {
    super({
      service: new PagoService(),
      EntityClass: Pago,
      max,
    });
    this.idFacturaFiltro = null;
  }

  async cargar(first = this.first, max = this.max) {
    return super.cargar(first, max, { idFactura: this.idFacturaFiltro });
  }

  async cargarPorFactura(idFactura, first = 0, max = this.max) {
    this.idFacturaFiltro = idFactura;
    return this.cargar(first, max);
  }

  nuevo(valoresIniciales = {}) {
    return super.nuevo({
      idFactura: this.idFacturaFiltro,
      ...valoresIniciales,
    });
  }

  async modificar(id = this.registro?.idPago) {
    return super.modificar(id);
  }
}