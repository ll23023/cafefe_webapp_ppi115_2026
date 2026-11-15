import { BaseService } from './BaseService.js';
import { Descuento } from '../entity/Descuento.js';

/**
 * Servicio REST para Descuento
 * @author MikeLB
 */
export class DescuentoService extends BaseService {
    constructor() {
        super(Descuento.ENDPOINT, Descuento);
    }

    findByTipoDescuento(idTipoDescuento, first = 0, max = 50) {
        return this.findRange(first, max, { idTipoDescuento });
    }
}