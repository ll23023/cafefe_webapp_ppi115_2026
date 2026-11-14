/**
 *
 * @author Mil
 */

export class Rol {

  /**
   * @param {Object} [data={}]
   * @param {string|null} [data.idRol] - UUID
   * @param {string|null} [data.nombre]
   * @param {boolean|null} [data.activo]
   * @param {string|null} [data.observaciones]
   * @param {Array} [data.empleadoRolList] - @JsonbTransient en backend
   */

  constructor(data = {}) {
    this.idRol = data.idRol ?? null;
    this.nombre = data.nombre ?? null;
    this.activo = data.activo ?? null;
    this.observaciones = data.observaciones ?? null;
    this.empleadoRolList = data.empleadoRolList ?? [];
  }

  equals(other) {
    if (!(other instanceof Rol)) return false;
    return this.idRol !== null && this.idRol === other.idRol;
  }

  toString() {
    return `Rol[ idRol=${this.idRol} ]`;
  }
  
}