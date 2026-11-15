import { BaseModel } from './BaseModel.js';
import { ProductoTipoProductoService } from '../control/ProductoTipoProductoService.js';
import { ProductoTipoProducto } from '../entity/ProductoTipoProducto.js';

/**
 * Modelo de vista para ProductoTipoProducto
 * @author MikeLB
 */
export class ProductoTipoProductoModel extends BaseModel {
    constructor(tamanoPagina = 10) {
        super(new ProductoTipoProductoService(), ProductoTipoProducto, tamanoPagina);
    }

    async cargarPorProducto(idProducto) {
        this.filtros = idProducto ? { idProducto } : {};
        return this.cargar();
    }
}