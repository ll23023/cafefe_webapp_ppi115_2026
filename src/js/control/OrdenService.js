import { Orden } from '../entity/Orden.js';
import { BaseService } from './BaseService.js';

/**
 *
 * @author Mil
 */

export class OrdenService extends BaseService {
  
  constructor() {
    super('orden', Orden, 'first-max');
  }

  async create(datos) {
    return super.create({
      idEmpleadoRol: BaseService.extraerUuid(datos.idEmpleadoRol, 'idEmpleadoRol'),
    });
  }

  async update(id, datos) {
    return super.update(id, {
      idEmpleadoRol: BaseService.extraerUuid(datos.idEmpleadoRol, 'idEmpleadoRol'),
    });
  }

}