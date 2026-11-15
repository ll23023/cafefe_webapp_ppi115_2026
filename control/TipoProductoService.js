import { BaseService } from './BaseService.js';
import { TipoProducto } from '../entity/TipoProducto.js';

/**
 * Servicio REST para TipoProducto
 * @author MikeLB
 */
export class TipoProductoService extends BaseService {
    constructor() {
        super(TipoProducto.ENDPOINT, TipoProducto);
    }
}