/**
 * Entidad TipoProducto
 * @author MikeLB
 */
export class TipoProducto {
    static ENDPOINT = 'tipo_producto';

    constructor({
        idTipoProducto = null,
        nombre = '',
        activo = true,
        observaciones = ''
    } = {}) {
        this.idTipoProducto = idTipoProducto
            ? String(idTipoProducto).trim().toLowerCase()
            : null;
        this.nombre = nombre ?? '';
        this.activo = activo !== undefined && activo !== null ? Boolean(activo) : true;
        this.observaciones = observaciones ?? '';
    }

    static desdeJSON(json) {
        if (!json || typeof json !== 'object' || Array.isArray(json)) {
            throw new TypeError('Se esperaba un objeto JSON válido para TipoProducto');
        }
        return new TipoProducto({
            idTipoProducto: json.idTipoProducto ?? null,
            nombre: json.nombre ?? '',
            activo: json.activo ?? true,
            observaciones: json.observaciones ?? ''
        });
    }

    validar() {
        const errores = {};
        const nombreLimpio = typeof this.nombre === 'string' ? this.nombre.trim() : '';

        if (!nombreLimpio) {
            errores.nombre = 'El nombre del tipo de producto es obligatorio.';
        } else if (nombreLimpio.length > 155) {
            errores.nombre = 'El nombre no puede exceder los 155 caracteres.';
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
            observaciones: this.observaciones ? String(this.observaciones).trim() : null
        };
    }

    toJSON() {
        return {
            idTipoProducto: this.idTipoProducto,
            nombre: this.nombre,
            activo: this.activo,
            observaciones: this.observaciones
        };
    }
}