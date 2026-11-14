/**
 *
 * @author Mil
 */

export class EmpleadoRol {

  /**
   * @param {Object} [data={}]
   * @param {string|null} [data.idEmpleadoRol] - UUID
   * @param {boolean|null} [data.activo]
   * @param {string|null} [data.observaciones]
   * @param {Object|null} [data.idEmpleado]
   * @param {Object|null} [data.idRol]
   * @param {Array} [data.facturaList] - @JsonbTransient en backend
   * @param {Array} [data.ordenList] - @JsonbTransient en backend
   */

  constructor(data = {}) {
    this.idEmpleadoRol = data.idEmpleadoRol ?? null;
    this.activo = data.activo ?? null;
    this.observaciones = data.observaciones ?? null;
    this.idEmpleado = data.idEmpleado ?? null;
    this.idRol = data.idRol ?? null;
    this.facturaList = data.facturaList ?? [];
    this.ordenList = data.ordenList ?? [];
  }

  equals(other) {
    if (!(other instanceof EmpleadoRol)) return false;
    return this.idEmpleadoRol !== null && this.idEmpleadoRol === other.idEmpleadoRol;
  }

  toString() {
    return `EmpleadoRol[ idEmpleadoRol=${this.idEmpleadoRol} ]`;
  }
  
}