import { BaseModel } from './BaseModel.js';
import { DescuentoProductoService } from '../control/DescuentoProductoService.js';
import { DescuentoProducto } from '../entity/DescuentoProducto.js';

/**
 * Modelo de vista para DescuentoProducto
 * @author MikeLB
 */
export class DescuentoProductoModel extends BaseModel {
    constructor(tamanoPagina = 10) {
        super(new DescuentoProductoService(), DescuentoProducto, tamanoPagina);
    }

    async cargarPorProducto(idProducto) {
        this.filtros = idProducto ? { idProducto } : {};
        return this.cargar();
    }
}