/**
 * Entidad Caracteristica
 * @author MikeLB
 */
export class Caracteristica {
    static ENDPOINT = 'caracteristica';

    constructor({
        idCaracteristica = null,
        nombre = '',
        activo = true,
        observaciones = '',
        idTipoCaracteristica = null
    } = {}) {
        this.idCaracteristica = idCaracteristica ? String(idCaracteristica).trim().toLowerCase() : null;
        this.nombre = nombre ?? '';
        this.activo = activo !== undefined && activo !== null ? Boolean(activo) : true;
        this.observaciones = observaciones ?? '';
        this.idTipoCaracteristica = idTipoCaracteristica ?? null;
    }

    static desdeJSON(json) {
        if (!json || typeof json !== 'object' || Array.isArray(json)) {
            throw new TypeError('Se esperaba un objeto JSON válido para Caracteristica');
        }
        return new Caracteristica({
            idCaracteristica: json.idCaracteristica ?? null,
            nombre: json.nombre ?? '',
            activo: json.activo ?? true,
            observaciones: json.observaciones ?? '',
            idTipoCaracteristica: json.idTipoCaracteristica ?? null
        });
    }

    validar() {
        const errores = {};
        const nombreLimpio = typeof this.nombre === 'string' ? this.nombre.trim() : '';

        if (!nombreLimpio) {
            errores.nombre = 'El nombre de la característica es obligatorio.';
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
        const idTipo = typeof this.idTipoCaracteristica === 'object' && this.idTipoCaracteristica !== null
            ? this.idTipoCaracteristica.idTipoCaracteristica
            : this.idTipoCaracteristica;

        return {
            nombre: typeof this.nombre === 'string' ? this.nombre.trim() : '',
            activo: Boolean(this.activo),
            observaciones: this.observaciones ? String(this.observaciones).trim() : null,
            idTipoCaracteristica: idTipo ? String(idTipo).trim().toLowerCase() : null
        };
    }

    toJSON() {
        return {
            idCaracteristica: this.idCaracteristica,
            nombre: this.nombre,
            activo: this.activo,
            observaciones: this.observaciones,
            idTipoCaracteristica: this.idTipoCaracteristica
        };
    }
}