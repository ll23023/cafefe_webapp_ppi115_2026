/**
 *
 * @author Mil
 */

import { Empleado } from '../entity/Empleado.js';
import { EmpleadoService } from '../control/EmpleadoService.js';
import { BaseModel } from './BaseModel.js';

export class EmpleadoModel extends BaseModel {
  constructor(max = 10) {
    super({
      service: new EmpleadoService(),
      EntityClass: Empleado,
      max,
    });
    this.rolesSeleccionados = [];
  }

  nuevo(valoresIniciales = {}) {
    this.rolesSeleccionados = [];
    return super.nuevo({ activo: true, ...valoresIniciales });
  }

  async guardar(roles = this.rolesSeleccionados) {
    return super.guardar(roles);
  }

  async modificar(id = this.registro?.idEmpleado, roles = this.rolesSeleccionados) {
    return super.modificar(id, roles);
  }
}