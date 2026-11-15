import { BaseService } from './BaseService.js';
import { TipoCaracteristica } from '../entity/TipoCaracteristica.js';

/**
 * Servicio REST para TipoCaracteristica
 * @author MikeLB
 */
export class TipoCaracteristicaService extends BaseService {
    constructor() {
        super(TipoCaracteristica.ENDPOINT, TipoCaracteristica);
    }
}