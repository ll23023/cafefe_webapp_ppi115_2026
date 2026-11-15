/**
 *
 * @author Mil
 */

import { Rol } from '../entity/Rol.js';
import { RolService } from '../control/RolService.js';
import { BaseModel } from './BaseModel.js';

export class RolModel extends BaseModel {
  constructor(max = 10) {
    super({
      service: new RolService(),
      EntityClass: Rol,
      max,
    });
  }

  nuevo(valoresIniciales = {}) {
    return super.nuevo({ idRol: null, activo: true, ...valoresIniciales });
  }

  async modificar(id = this.registro?.idRol) {
    return super.modificar(id);
  }
}