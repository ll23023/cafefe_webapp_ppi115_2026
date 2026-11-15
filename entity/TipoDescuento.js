/**
 * Entidad TipoDescuento
 * @author MikeLB
 */
export class TipoDescuento {
    static ENDPOINT = 'tipo_descuento';

    constructor({
        idTipoDescuento = null,
        nombre = '',
        activo = true,
        descuentoMaximo = null,
        observaciones = ''
    } = {}) {
        this.idTipoDescuento = idTipoDescuento
            ? String(idTipoDescuento).trim().toLowerCase()
            : null;
        this.nombre = nombre ?? '';
        this.activo = activo !== undefined && activo !== null ? Boolean(activo) : true;
        this.descuentoMaximo = descuentoMaximo !== null && descuentoMaximo !== undefined && descuentoMaximo !== ''
            ? Number.parseInt(descuentoMaximo, 10)
            : null;
        this.observaciones = observaciones ?? '';
    }

    static desdeJSON(json) {
        if (!json || typeof json !== 'object' || Array.isArray(json)) {
            throw new TypeError('Se esperaba un objeto JSON válido para TipoDescuento');
        }
        return new TipoDescuento({
            idTipoDescuento: json.idTipoDescuento ?? null,
            nombre: json.nombre ?? '',
            activo: json.activo ?? true,
            descuentoMaximo: json.descuentoMaximo ?? null,
            observaciones: json.observaciones ?? ''
        });
    }

    validar() {
        const errores = {};
        const nombreLimpio = typeof this.nombre === 'string' ? this.nombre.trim() : '';

        if (!nombreLimpio) {
            errores.nombre = 'El nombre del tipo de descuento es obligatorio.';
        }

        if (this.descuentoMaximo !== null && (!Number.isInteger(this.descuentoMaximo) || this.descuentoMaximo < 0)) {
            errores.descuentoMaximo = 'El descuento máximo debe ser un entero mayor o igual a 0.';
        }

        if (typeof this.activo !== 'boolean') {
            errores.activo = 'El estado activo debe ser booleano.';
        }

        return errores;
    }

    esValido() {
        return Object.keys(this.validar()).length === 0;
    }

    aSolicitud() {
        return {
            nombre: typeof this.nombre === 'string' ? this.nombre.trim() : '',
            activo: Boolean(this.activo),
            descuentoMaximo: this.descuentoMaximo,
            observaciones: this.observaciones ? String(this.observaciones).trim() : null
        };
    }

    toJSON() {
        return {
            idTipoDescuento: this.idTipoDescuento,
            nombre: this.nombre,
            activo: this.activo,
            descuentoMaximo: this.descuentoMaximo,
            observaciones: this.observaciones
        };
    }
}