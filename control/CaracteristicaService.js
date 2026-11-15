import { BaseService } from './BaseService.js';
import { Caracteristica } from '../entity/Caracteristica.js';

/**
 * Servicio REST para Caracteristica
 * @author MikeLB
 */
export class CaracteristicaService extends BaseService {
    constructor() {
        super(Caracteristica.ENDPOINT, Caracteristica);
    }
}