import { FacturaOrdenProducto } from '../entity/FacturaOrdenProducto.js';
import { BaseService } from './BaseService.js';

/**
 *
 * @author Mil
 */

export class FacturaOrdenProductoService extends BaseService {

  constructor() {
    super('factura-orden-producto', FacturaOrdenProducto, 'first-max');
  }

  async findByFactura(idFactura, first = 0, max = 50) {
    return super.findRange(first, max, { idFactura });
  }

  async create(datos) {
    return super.create({
      idFactura: BaseService.extraerUuid(datos.idFactura, 'idFactura'),
      idOrdenProducto: BaseService.extraerUuid(datos.idOrdenProducto, 'idOrdenProducto'),
      precio: datos.precio,
      observaciones: datos.observaciones ?? '',
    });
  }

  async update(id, datos) {
    return super.update(id, {
      idFactura: BaseService.extraerUuid(datos.idFactura, 'idFactura'),
      idOrdenProducto: BaseService.extraerUuid(datos.idOrdenProducto, 'idOrdenProducto'),
      precio: datos.precio ?? null,
      observaciones: datos.observaciones ?? null,
    });
  }
  
}