/**
 * Entidad ProductoCaracteristica
 * @author MikeLB
 */
export class ProductoCaracteristica {
    static ENDPOINT = 'producto_caracteristica';

    constructor({
        idProductoCaracteristica = null,
        valor = '',
        idCaracteristica = null,
        idProducto = null
    } = {}) {
        this.idProductoCaracteristica = idProductoCaracteristica
            ? String(idProductoCaracteristica).trim().toLowerCase()
            : null;
        this.valor = valor ?? '';
        this.idCaracteristica = idCaracteristica ?? null;
        this.idProducto = idProducto ?? null;
    }

    static desdeJSON(json) {
        if (!json || typeof json !== 'object' || Array.isArray(json)) {
            throw new TypeError('Se esperaba un objeto JSON válido para ProductoCaracteristica');
        }
        return new ProductoCaracteristica({
            idProductoCaracteristica: json.idProductoCaracteristica ?? null,
            valor: json.valor ?? '',
            idCaracteristica: json.idCaracteristica ?? null,
            idProducto: json.idProducto ?? null
        });
    }

    validar() {
        const errores = {};
        const valorLimpio = typeof this.valor === 'string' ? this.valor.trim() : '';

        if (!valorLimpio) {
            errores.valor = 'El valor de la característica es obligatorio.';
        }

        return errores;
    }

    esValido() {
        return Object.keys(this.validar()).length === 0;
    }

    aSolicitud() {
        const idCaract = typeof this.idCaracteristica === 'object' && this.idCaracteristica !== null
            ? this.idCaracteristica.idCaracteristica
            : this.idCaracteristica;
        const idProd = typeof this.idProducto === 'object' && this.idProducto !== null
            ? this.idProducto.idProducto
            : this.idProducto;

        return {
            valor: typeof this.valor === 'string' ? this.valor.trim() : '',
            idCaracteristica: idCaract ? String(idCaract).trim().toLowerCase() : null,
            idProducto: idProd ? String(idProd).trim().toLowerCase() : null
        };
    }

    toJSON() {
        return {
            idProductoCaracteristica: this.idProductoCaracteristica,
            valor: this.valor,
            idCaracteristica: this.idCaracteristica,
            idProducto: this.idProducto
        };
    }
}