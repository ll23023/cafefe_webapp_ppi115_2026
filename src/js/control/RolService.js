import { Rol } from '../entity/Rol.js';
import { BaseService } from './BaseService.js';

/**
 *
 * @author Mil
 */

export class RolService extends BaseService {
  constructor() {
    super('rol', Rol, 'first-max');
  }

  async create(datos) {
    // RolResource exige que idRol sea null al crear
    // porque en el backend tiene una validación explícita que 
    // rechaza la petición si el objeto ya trae un ID
    return super.create({
      idRol: null,
      nombre: datos.nombre ?? '',
      activo: datos.activo ?? true,
      observaciones: datos.observaciones ?? '',
    });
  }

  async update(id, datos) {
    return super.update(id, {
      idRol: id,
      nombre: datos.nombre ?? '',
      activo: datos.activo ?? true,
      observaciones: datos.observaciones ?? '',
    });
  }

}