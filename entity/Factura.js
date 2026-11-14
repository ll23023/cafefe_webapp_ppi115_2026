/**
 *
 * @author Mil
 */

export class Factura {

  /**
   * @param {Object} [data={}]
   * @param {string|null} [data.idFactura] - UUID
   * @param {string|null} [data.cliente]
   * @param {Date|string|null} [data.fechaFacturacion]
   * @param {string|null} [data.estado]
   * @param {string|null} [data.observaciones]
   * @param {Array} [data.pagoList] - @JsonbTransient en backend
   * @param {Array} [data.facturaOrdenProductoList] - @JsonbTransient en backend
   * @param {Object|null} [data.idCaja]
   * @param {Object|null} [data.idEmpleadoRol]
   */

  constructor(data = {}) {
    this.idFactura = data.idFactura ?? null;
    this.cliente = data.cliente ?? null;
    this.fechaFacturacion = data.fechaFacturacion ? new Date(data.fechaFacturacion) : null;
    this.estado = data.estado ?? null;
    this.observaciones = data.observaciones ?? null;
    this.pagoList = data.pagoList ?? [];
    this.facturaOrdenProductoList = data.facturaOrdenProductoList ?? [];
    this.idCaja = data.idCaja ?? null;
    this.idEmpleadoRol = data.idEmpleadoRol ?? null;
  }

  equals(other) {
    if (!(other instanceof Factura)) return false;
    return this.idFactura !== null && this.idFactura === other.idFactura;
  }

  toString() {
    return `Factura[ idFactura=${this.idFactura} ]`;
  }
  
}