import { BaseService } from './BaseService.js';
import { DescuentoProducto } from '../entity/DescuentoProducto.js';

/**
 * Servicio REST para DescuentoProducto
 * @author MikeLB
 */
export class DescuentoProductoService extends BaseService {
    constructor() {
        super(DescuentoProducto.ENDPOINT, DescuentoProducto);
    }

    findByProducto(idProducto, first = 0, max = 50) {
        return this.findRange(first, max, { idProducto });
    }
}