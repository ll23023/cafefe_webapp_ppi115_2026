import { Factura } from '../entity/Factura.js';
import { BaseService } from './BaseService.js';

/**
 *
 * @author Mil
 */

export class FacturaService extends BaseService {

  constructor() {
    super('factura', Factura, 'first-max');
  }

  async create(datos) {
    return super.create({
      idCaja: BaseService.extraerUuid(datos.idCaja, 'idCaja'),
      idEmpleadoRol: BaseService.extraerUuid(datos.idEmpleadoRol, 'idEmpleadoRol'),
      cliente: datos.cliente ?? '',
      estado: datos.estado ?? null,
      observaciones: datos.observaciones ?? '',
    });
  }

  async update(id, datos) {
    return super.update(id, {
      idCaja: BaseService.extraerUuid(datos.idCaja, 'idCaja'),
      idEmpleadoRol: BaseService.extraerUuid(datos.idEmpleadoRol, 'idEmpleadoRol'),
      cliente: datos.cliente ?? null,
      estado: datos.estado ?? null,
      observaciones: datos.observaciones ?? null,
    });
  }
  
}