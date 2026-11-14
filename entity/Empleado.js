/**
 *
 * @author Mil
 */

export class Empleado {

  /**
   * @param {Object} [data={}]
   * @param {string|null} [data.idEmpleado] - UUID
   * @param {string|null} [data.nombre]
   * @param {string|null} [data.apellido]
   * @param {boolean|null} [data.activo]
   * @param {string|null} [data.comentarios]
   * @param {Array} [data.empleadoRolList] - @JsonbTransient en backend
   */

  constructor(data = {}) {
    this.idEmpleado = data.idEmpleado ?? null;
    this.nombre = data.nombre ?? null;
    this.apellido = data.apellido ?? null;
    this.activo = data.activo ?? null;
    this.comentarios = data.comentarios ?? null;
    this.empleadoRolList = data.empleadoRolList ?? [];
  }

  equals(other) {
    if (!(other instanceof Empleado)) return false;
    return this.idEmpleado !== null && this.idEmpleado === other.idEmpleado;
  }

  toString() {
    return `Empleado[ idEmpleado=${this.idEmpleado} ]`;
  }
  
}