/**
 *
 * @author Mil
 */

import { PagoDetalle } from '../entity/PagoDetalle.js';
import { PagoDetalleService } from '../control/PagoDetalleService.js';
import { BaseModel } from './BaseModel.js';

export class PagoDetalleModel extends BaseModel {
  constructor(max = 20) {
    super({
      service: new PagoDetalleService(),
      EntityClass: PagoDetalle,
      max,
    });
    this.idPagoFiltro = null;
  }

  async cargar(first = this.first, max = this.max) {
    return super.cargar(first, max, { idPago: this.idPagoFiltro });
  }

  async cargarPorPago(idPago, first = 0, max = this.max) {
    this.idPagoFiltro = idPago;
    return this.cargar(first, max);
  }

  nuevo(valoresIniciales = {}) {
    return super.nuevo({
      idPago: this.idPagoFiltro,
      ...valoresIniciales,
    });
  }

  async modificar(id = this.registro?.idPagoDetalle) {
    return super.modificar(id);
  }
}