/**
 *
 * @author Mil
 */

export class Pago {
  constructor(data = {}) {
    this.idPago = data.idPago ?? null;
    this.estado = data.estado ?? null;
    this.observaciones = data.observaciones ?? null;
    this.idFactura = data.idFactura ?? null;
    this.pagoDetalleList = data.pagoDetalleList ?? [];
  }

  equals(other) {
    if (!(other instanceof Pago)) return false;
    return this.idPago !== null && this.idPago === other.idPago;
  }

  toString() {
    return `Pago[ idPago=${this.idPago} ]`;
  }
}