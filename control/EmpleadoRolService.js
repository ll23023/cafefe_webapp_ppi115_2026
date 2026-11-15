import { EmpleadoRol } from '../entity/EmpleadoRol.js';
import { BaseService } from './BaseService.js';

/**
 *
 * @author Mil
 */

export class EmpleadoRolService extends BaseService {

  constructor() {
    super('empleado-rol', EmpleadoRol, 'first-max');
  }

  async create(datos) {
    return super.create({
      idEmpleado: BaseService.extraerUuid(datos.idEmpleado, 'idEmpleado'),
      idRol: BaseService.extraerUuid(datos.idRol, 'idRol'),
      activo: datos.activo ?? true,
      observaciones: datos.observaciones ?? '',
    });
  }

  async update(id, datos) {
    return super.update(id, {
      idEmpleado: BaseService.extraerUuid(datos.idEmpleado, 'idEmpleado'),
      idRol: BaseService.extraerUuid(datos.idRol, 'idRol'),
      activo: datos.activo,
      observaciones: datos.observaciones ?? '',
    });
  }
  
}