/**
 *
 * @author Mil
 */

export class PagoDetalle {

  /**
   * @param {Object} [data={}]
   * @param {string|null} [data.idPagoDetalle] - UUID
   * @param {number|null} [data.monto]
   * @param {string|null} [data.tipoPago]
   * @param {string|null} [data.observaciones]
   * @param {string|null} [data.referenciaExterna]
   * @param {Object|null} [data.idPago]
   */

  constructor(data = {}) {
    this.idPagoDetalle = data.idPagoDetalle ?? null;
    this.monto = data.monto ?? null;
    this.tipoPago = data.tipoPago ?? null;
    this.observaciones = data.observaciones ?? null;
    this.referenciaExterna = data.referenciaExterna ?? null;
    this.idPago = data.idPago ?? null;
  }

  equals(other) {
    if (!(other instanceof PagoDetalle)) return false;
    return this.idPagoDetalle !== null && this.idPagoDetalle === other.idPagoDetalle;
  }

  toString() {
    return `PagoDetalle[ idPagoDetalle=${this.idPagoDetalle} ]`;
  }
  
}