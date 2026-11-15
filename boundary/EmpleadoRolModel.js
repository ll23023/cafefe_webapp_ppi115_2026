/**
 *
 * @author Mil
 */

import { EmpleadoRol } from '../entity/EmpleadoRol.js';
import { EmpleadoRolService } from '../control/EmpleadoRolService.js';
import { BaseModel } from './BaseModel.js';

export class EmpleadoRolModel extends BaseModel {
  constructor(max = 10) {
    super({
      service: new EmpleadoRolService(),
      EntityClass: EmpleadoRol,
      max,
    });
  }

  async modificar(id = this.registro?.idEmpleadoRol) {
    return super.modificar(id);
  }
}