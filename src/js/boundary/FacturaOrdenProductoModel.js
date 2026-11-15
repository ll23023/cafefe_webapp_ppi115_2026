/**
 *
 * @author Mil
 */

import { FacturaOrdenProducto } from '../entity/FacturaOrdenProducto.js';
import { FacturaOrdenProductoService } from '../control/FacturaOrdenProductoService.js';
import { BaseModel } from './BaseModel.js';

export class FacturaOrdenProductoModel extends BaseModel {
  constructor(max = 20) {
    super({
      service: new FacturaOrdenProductoService(),
      EntityClass: FacturaOrdenProducto,
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

  async modificar(id = this.registro?.idFacturaOrdenProducto) {
    return super.modificar(id);
  }
}