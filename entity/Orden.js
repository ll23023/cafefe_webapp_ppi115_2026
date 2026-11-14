/**
 *
 * @author Mil
 */

export class Orden {

  /**
   * @param {Object} [data={}]
   * @param {string|null} [data.idOrden] - UUID
   * @param {Date|string|null} [data.fechaCreacion]
   * @param {Array} [data.ordenProductoList] - @JsonbTransient en backend
   * @param {Object|null} [data.idEmpleadoRol]
   */

  constructor(data = {}) {
    this.idOrden = data.idOrden ?? null;
    this.fechaCreacion = data.fechaCreacion ? new Date(data.fechaCreacion) : null;
    this.ordenProductoList = data.ordenProductoList ?? [];
    this.idEmpleadoRol = data.idEmpleadoRol ?? null;
  }

  equals(other) {
    if (!(other instanceof Orden)) return false;
    return this.idOrden !== null && this.idOrden === other.idOrden;
  }

  toString() {
    return `Orden[ idOrden=${this.idOrden} ]`;
  }
  
}