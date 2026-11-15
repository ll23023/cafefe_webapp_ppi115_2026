import { Pago } from '../entity/Pago.js';
import { BaseService } from './BaseService.js';

/**
 *
 * @author Mil
 */

export class PagoService extends BaseService {
  constructor() {
    super('pago', Pago, 'first-max');
  }

  async findByFactura(idFactura, first = 0, max = 50) {
    return super.findRange(first, max, { idFactura });
  }

  async create(datos) {
    return super.create({
      idFactura: BaseService.extraerUuid(datos.idFactura, 'idFactura'),
      estado: datos.estado ?? null,
      observaciones: datos.observaciones ?? '',
    });
  }

  async update(id, datos) {
    return super.update(id, {
      idFactura: BaseService.extraerUuid(datos.idFactura, 'idFactura'),
      estado: datos.estado ?? null,
      observaciones: datos.observaciones ?? null,
    });
  }
  
}