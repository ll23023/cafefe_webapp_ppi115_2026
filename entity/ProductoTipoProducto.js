/**
 * Entidad ProductoTipoProducto
 * @author MikeLB
 */
export class ProductoTipoProducto {
    static ENDPOINT = 'producto_tipo_producto';

    constructor({
        idProductoTipoProducto = null,
        fechaCreacion = null,
        observaciones = '',
        idProducto = null,
        idTipoProducto = null
    } = {}) {
        this.idProductoTipoProducto = idProductoTipoProducto
            ? String(idProductoTipoProducto).trim().toLowerCase()
            : null;
        this.fechaCreacion = fechaCreacion ?? null;
        this.observaciones = observaciones ?? '';
        this.idProducto = idProducto ?? null;
        this.idTipoProducto = idTipoProducto ?? null;
    }

    static desdeJSON(json) {
        if (!json || typeof json !== 'object' || Array.isArray(json)) {
            throw new TypeError('Se esperaba un objeto JSON válido para ProductoTipoProducto');
        }
        return new ProductoTipoProducto({
            idProductoTipoProducto: json.idProductoTipoProducto ?? null,
            fechaCreacion: json.fechaCreacion ?? null,
            observaciones: json.observaciones ?? '',
            idProducto: json.idProducto ?? null,
            idTipoProducto: json.idTipoProducto ?? null
        });
    }

    validar() {
        const errores = {};

        if (!this.idProducto) {
            errores.idProducto = 'El producto es obligatorio.';
        }

        if (!this.idTipoProducto) {
            errores.idTipoProducto = 'El tipo de producto es obligatorio.';
        }

        return errores;
    }

    esValido() {
        return Object.keys(this.validar()).length === 0;
    }

    aSolicitud() {
        const idProd = typeof this.idProducto === 'object' && this.idProducto !== null
            ? this.idProducto.idProducto
            : this.idProducto;
        const idTipo = typeof this.idTipoProducto === 'object' && this.idTipoProducto !== null
            ? this.idTipoProducto.idTipoProducto
            : this.idTipoProducto;

        return {
            fechaCreacion: this.fechaCreacion instanceof Date
                ? this.fechaCreacion.toISOString()
                : (this.fechaCreacion || null),
            observaciones: this.observaciones ? String(this.observaciones).trim() : null,
            idProducto: idProd ? String(idProd).trim().toLowerCase() : null,
            idTipoProducto: idTipo ? String(idTipo).trim().toLowerCase() : null
        };
    }

    toJSON() {
        return {
            idProductoTipoProducto: this.idProductoTipoProducto,
            fechaCreacion: this.fechaCreacion,
            observaciones: this.observaciones,
            idProducto: this.idProducto,
            idTipoProducto: this.idTipoProducto
        };
    }
}