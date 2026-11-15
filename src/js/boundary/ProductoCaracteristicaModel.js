import { BaseModel } from './BaseModel.js';
import { ProductoCaracteristicaService } from '../control/ProductoCaracteristicaService.js';
import { ProductoCaracteristica } from '../entity/ProductoCaracteristica.js';

/**
 * Modelo de vista para ProductoCaracteristica
 * @author MikeLB
 */
export class ProductoCaracteristicaModel extends BaseModel {
    constructor(tamanoPagina = 10) {
        super({
            service: new ProductoCaracteristicaService(),
            EntityClass: ProductoCaracteristica,
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