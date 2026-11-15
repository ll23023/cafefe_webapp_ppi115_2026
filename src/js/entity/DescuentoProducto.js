/**
 * Entidad DescuentoProducto
 * @author MikeLB
 */
export class DescuentoProducto {
    static ENDPOINT = 'descuento_producto';

    constructor({
        idDescuentoProducto = null,
        fechaDesde = null,
        fechaHasta = null,
        valor = null,
        observaciones = '',
        idDescuento = null,
        idProducto = null
    } = {}) {
        this.idDescuentoProducto = idDescuentoProducto ? String(idDescuentoProducto).trim().toLowerCase() : null;
        this.fechaDesde = fechaDesde ?? null;
        this.fechaHasta = fechaHasta ?? null;
        this.valor = valor !== null && valor !== undefined && valor !== '' ? Number.parseInt(valor, 10) : null;
        this.observaciones = observaciones ?? '';
        this.idDescuento = idDescuento ?? null;
        this.idProducto = idProducto ?? null;
    }

    static desdeJSON(json) {
        if (!json || typeof json !== 'object' || Array.isArray(json)) {
            throw new TypeError('Se esperaba un objeto JSON válido para DescuentoProducto');
        }
        return new DescuentoProducto({
            idDescuentoProducto: json.idDescuentoProducto ?? null,
            fechaDesde: json.fechaDesde ?? null,
            fechaHasta: json.fechaHasta ?? null,
            valor: json.valor ?? null,
            observaciones: json.observaciones ?? '',
            idDescuento: json.idDescuento ?? null,
            idProducto: json.idProducto ?? null
        });
    }

    validar() {
        const errores = {};

        if (this.valor !== null && (!Number.isInteger(this.valor) || this.valor < 0)) {
            errores.valor = 'El valor del descuento debe ser un número entero mayor o igual a 0.';
        }

        if (this.fechaDesde && this.fechaHasta) {
            const desde = new Date(this.fechaDesde);
            const hasta = new Date(this.fechaHasta);
            if (!Number.isNaN(desde.getTime()) && !Number.isNaN(hasta.getTime()) && hasta < desde) {
                errores.fechaHasta = 'La fecha hasta no puede ser anterior a la fecha desde.';
            }
        }

        return errores;
    }

    esValido() {
        return Object.keys(this.validar()).length === 0;
    }

    aSolicitud() {
        const idDesc = typeof this.idDescuento === 'object' && this.idDescuento !== null
            ? this.idDescuento.idDescuento
            : this.idDescuento;
        const idProd = typeof this.idProducto === 'object' && this.idProducto !== null
            ? this.idProducto.idProducto
            : this.idProducto;

        return {
            fechaDesde: this.fechaDesde instanceof Date ? this.fechaDesde.toISOString() : (this.fechaDesde || null),
            fechaHasta: this.fechaHasta instanceof Date ? this.fechaHasta.toISOString() : (this.fechaHasta || null),
            valor: this.valor,
            observaciones: this.observaciones ? String(this.observaciones).trim() : null,
            idDescuento: idDesc ? String(idDesc).trim().toLowerCase() : null,
            idProducto: idProd ? String(idProd).trim().toLowerCase() : null
        };
    }

    toJSON() {
        return {
            idDescuentoProducto: this.idDescuentoProducto,
            fechaDesde: this.fechaDesde,
            fechaHasta: this.fechaHasta,
            valor: this.valor,
            observaciones: this.observaciones,
            idDescuento: this.idDescuento,
            idProducto: this.idProducto
        };
    }
}