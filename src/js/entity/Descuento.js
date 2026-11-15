/**
 * Entidad Descuento
 * @author MikeLB
 */
export class Descuento {
    static ENDPOINT = 'descuento';

    constructor({
        idDescuento = null,
        nombre = '',
        fechaDesde = null,
        fechaHasta = null,
        observaciones = '',
        idTipoDescuento = null
    } = {}) {
        this.idDescuento = idDescuento ? String(idDescuento).trim().toLowerCase() : null;
        this.nombre = nombre ?? '';
        this.fechaDesde = fechaDesde ?? null;
        this.fechaHasta = fechaHasta ?? null;
        this.observaciones = observaciones ?? '';
        this.idTipoDescuento = idTipoDescuento ?? null;
    }

    static desdeJSON(json) {
        if (!json || typeof json !== 'object' || Array.isArray(json)) {
            throw new TypeError('Se esperaba un objeto JSON válido para Descuento');
        }
        return new Descuento({
            idDescuento: json.idDescuento ?? null,
            nombre: json.nombre ?? '',
            fechaDesde: json.fechaDesde ?? null,
            fechaHasta: json.fechaHasta ?? null,
            observaciones: json.observaciones ?? '',
            idTipoDescuento: json.idTipoDescuento ?? null
        });
    }

    validar() {
        const errores = {};
        const nombreLimpio = typeof this.nombre === 'string' ? this.nombre.trim() : '';

        if (!nombreLimpio) {
            errores.nombre = 'El nombre del descuento es obligatorio.';
        } else if (nombreLimpio.length > 155) {
            errores.nombre = 'El nombre no puede exceder los 155 caracteres.';
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
        const idTipo = typeof this.idTipoDescuento === 'object' && this.idTipoDescuento !== null
            ? this.idTipoDescuento.idTipoDescuento
            : this.idTipoDescuento;

        return {
            nombre: typeof this.nombre === 'string' ? this.nombre.trim() : '',
            fechaDesde: this.fechaDesde instanceof Date ? this.fechaDesde.toISOString() : (this.fechaDesde || null),
            fechaHasta: this.fechaHasta instanceof Date ? this.fechaHasta.toISOString() : (this.fechaHasta || null),
            observaciones: this.observaciones ? String(this.observaciones).trim() : null,
            idTipoDescuento: idTipo ? String(idTipo).trim().toLowerCase() : null
        };
    }

    toJSON() {
        return {
            idDescuento: this.idDescuento,
            nombre: this.nombre,
            fechaDesde: this.fechaDesde,
            fechaHasta: this.fechaHasta,
            observaciones: this.observaciones,
            idTipoDescuento: this.idTipoDescuento
        };
    }
}