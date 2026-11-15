import { PagoDetalle } from '../entity/PagoDetalle.js';
import { BaseService } from './BaseService.js';

/**
 *
 * @author Mil
 */

export class PagoDetalleService extends BaseService {
  
  constructor() {
    super('pago-detalle', PagoDetalle, 'first-max');
  }

  async findByPago(idPago, first = 0, max = 50) {
    return super.findRange(first, max, { idPago });
  }

  async create(datos) {
    return super.create({
      idPago: BaseService.extraerUuid(datos.idPago, 'idPago'),
      monto: datos.monto,
      tipoPago: datos.tipoPago,
      observaciones: datos.observaciones ?? '',
      referenciaExterna: datos.referenciaExterna ?? '',
    });
  }

  async update(id, datos) {
    return super.update(id, {
      idPago: BaseService.extraerUuid(datos.idPago, 'idPago'),
      monto: datos.monto ?? null,
      tipoPago: datos.tipoPago ?? null,
      observaciones: datos.observaciones ?? null,
      referenciaExterna: datos.referenciaExterna ?? null,
    });
  }
  
}