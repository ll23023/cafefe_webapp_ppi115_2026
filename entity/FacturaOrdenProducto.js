/**
 *
 * @author Mil
 */

export class FacturaOrdenProducto {

  /**
   * @param {Object} [data={}]
   * @param {string|null} [data.idFacturaOrdenProducto] - UUID
   * @param {number|null} [data.precio]
   * @param {string|null} [data.observaciones]
   * @param {Object|null} [data.idFactura]
   * @param {Object|null} [data.idOrdenProducto]
   */

  constructor(data = {}) {
    this.idFacturaOrdenProducto = data.idFacturaOrdenProducto ?? null;
    this.precio = data.precio ?? null;
    this.observaciones = data.observaciones ?? null;
    this.idFactura = data.idFactura ?? null;
    this.idOrdenProducto = data.idOrdenProducto ?? null;
  }

  equals(other) {
    if (!(other instanceof FacturaOrdenProducto)) return false;
    return this.idFacturaOrdenProducto !== null && this.idFacturaOrdenProducto === other.idFacturaOrdenProducto;
  }

  toString() {
    return `FacturaOrdenProducto[ idFacturaOrdenProducto=${this.idFacturaOrdenProducto} ]`;
  }

}