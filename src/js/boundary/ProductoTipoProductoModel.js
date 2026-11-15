import { BaseModel } from './BaseModel.js';
import { ProductoTipoProductoService } from '../control/ProductoTipoProductoService.js';
import { ProductoTipoProducto } from '../entity/ProductoTipoProducto.js';

/**
 * Modelo de vista para ProductoTipoProducto
 * @author MikeLB
 */
export class ProductoTipoProductoModel extends BaseModel {
    constructor(tamanoPagina = 10) {
        super({
            service: new ProductoTipoProductoService(),
            EntityClass: ProductoTipoProducto,
            max: tamanoPagina,
        });
    }

    async cargar(first = this.first, max = this.max) {
        return super.cargar(first, max, this.filtros ?? {});
    }

    async cargarPorProducto(idProducto) {
        this.filtros = idProducto ? { idProducto } : {};
        return this.cargar();
    }
}