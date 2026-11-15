/**
 * Entidad TipoCaracteristica
 * @author MikeLB
 */
export class TipoCaracteristica {
    static ENDPOINT = 'tipo_caracteristica';

    constructor({
        idTipoCaracteristica = null,
        nombre = '',
        expresionRegular = '',
        activo = true,
        observaciones = ''
    } = {}) {
        this.idTipoCaracteristica = idTipoCaracteristica
            ? String(idTipoCaracteristica).trim().toLowerCase()
            : null;
        this.nombre = nombre ?? '';
        this.expresionRegular = expresionRegular ?? '';
        this.activo = activo !== undefined && activo !== null ? Boolean(activo) : true;
        this.observaciones = observaciones ?? '';
    }

    static desdeJSON(json) {
        if (!json || typeof json !== 'object' || Array.isArray(json)) {
            throw new TypeError('Se esperaba un objeto JSON válido para TipoCaracteristica');
        }
        return new TipoCaracteristica({
            idTipoCaracteristica: json.idTipoCaracteristica ?? null,
            nombre: json.nombre ?? '',
            expresionRegular: json.expresionRegular ?? '',
            activo: json.activo ?? true,
            observaciones: json.observaciones ?? ''
        });
    }

    validar() {
        const errores = {};
        const nombreLimpio = typeof this.nombre === 'string' ? this.nombre.trim() : '';

        if (!nombreLimpio) {
            errores.nombre = 'El nombre del tipo de característica es obligatorio.';
        } else if (nombreLimpio.length > 155) {
            errores.nombre = 'El nombre no puede exceder los 155 caracteres.';
        }

        if (this.expresionRegular) {
            try {
                new RegExp(this.expresionRegular);
            } catch {
                errores.expresionRegular = 'La expresión regular no es válida.';
            }
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
            expresionRegular: this.expresionRegular ? String(this.expresionRegular).trim() : null,
            activo: Boolean(this.activo),
            observaciones: this.observaciones ? String(this.observaciones).trim() : null
        };
    }

    toJSON() {
        return {
            idTipoCaracteristica: this.idTipoCaracteristica,
            nombre: this.nombre,
            expresionRegular: this.expresionRegular,
            activo: this.activo,
            observaciones: this.observaciones
        };
    }
}