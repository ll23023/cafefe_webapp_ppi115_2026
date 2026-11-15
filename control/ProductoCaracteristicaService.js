import { BaseService } from './BaseService.js';
import { ProductoCaracteristica } from '../entity/ProductoCaracteristica.js';

/**
 * Servicio REST para ProductoCaracteristica
 * @author MikeLB
 */
export class ProductoCaracteristicaService extends BaseService {
    constructor() {
        super(ProductoCaracteristica.ENDPOINT, ProductoCaracteristica);
    }

    findByProducto(idProducto, first = 0, max = 50) {
        return this.findRange(first, max, { idProducto });
    }
}