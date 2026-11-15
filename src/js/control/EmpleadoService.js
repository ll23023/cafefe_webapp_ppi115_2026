import { Empleado } from '../entity/Empleado.js';
import { BaseService } from './BaseService.js';

/**
 *
 * @author Mil
 */

export class EmpleadoService extends BaseService {

  constructor() {
    super('empleado', Empleado, 'first-max');
  }

  async create(empleado, roles = []) {
    return super.create({
      nombre: empleado.nombre,
      apellido: empleado.apellido,
      activo: empleado.activo ?? true,
      comentarios: empleado.comentarios ?? '',
      roles,
    });
  }

  async update(id, empleado, roles = []) {
    return super.update(id, {
      nombre: empleado.nombre,
      apellido: empleado.apellido,
      activo: empleado.activo,
      comentarios: empleado.comentarios ?? '',
      roles,
    });
  }
  
}