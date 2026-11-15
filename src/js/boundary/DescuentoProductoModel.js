import { BaseModel } from './BaseModel.js';
import { DescuentoProductoService } from '../control/DescuentoProductoService.js';
import { DescuentoProducto } from '../entity/DescuentoProducto.js';

/**
 * Modelo de vista para DescuentoProducto
 * @author MikeLB
 */
export class DescuentoProductoModel extends BaseModel {
    constructor(tamanoPagina = 10) {
        super({
            service: new DescuentoProductoService(),
            EntityClass: DescuentoProducto,
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