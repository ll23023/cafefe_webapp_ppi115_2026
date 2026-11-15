/**
 *
 * @author Mil
 */

export class OrdenProducto {
  constructor(data = {}) {
    this.idOrdenProducto = data.idOrdenProducto ?? null;
    this.precio = data.precio ?? null;
    this.observaciones = data.observaciones ?? null;
    this.facturaOrdenProductoList = data.facturaOrdenProductoList ?? [];
    this.idOrden = data.idOrden ?? null;
    this.idProducto = data.idProducto ?? null;
  }

  equals(other) {
    if (!(other instanceof OrdenProducto)) return false;
    return this.idOrdenProducto !== null && this.idOrdenProducto === other.idOrdenProducto;
  }

  toString() {
    return `OrdenProducto[ idOrdenProducto=${this.idOrdenProducto} ]`;
  }
}