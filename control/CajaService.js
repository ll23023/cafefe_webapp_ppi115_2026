import { BaseService } from './BaseService.js';
import { Caja } from '../entity/Caja.js';

/**
 * Servicio REST para Caja
 * @author MikeLB
 */
export class CajaService extends BaseService {
    constructor() {
        super(Caja.ENDPOINT, Caja);
    }
}