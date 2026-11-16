import { BaseService } from './BaseService.js';
import { ProductoTipoProducto } from '../entity/ProductoTipoProducto.js';

/**
 * Servicio REST para ProductoTipoProducto
 * @author MikeLB
 */
export class ProductoTipoProductoService extends BaseService {
    constructor() {
        super(ProductoTipoProducto.ENDPOINT, ProductoTipoProducto, 'desde-hasta');
    }

    findByProducto(idProducto, first = 0, max = 50) {
        return this.findRange(first, max, { idProducto });
    }
}