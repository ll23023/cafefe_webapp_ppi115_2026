import { BaseService } from './BaseService.js';
import { TipoDescuento } from '../entity/TipoDescuento.js';

/**
 * Servicio REST para TipoDescuento
 * @author MikeLB
 */
export class TipoDescuentoService extends BaseService {
    constructor() {
        super(TipoDescuento.ENDPOINT, TipoDescuento);
    }
}