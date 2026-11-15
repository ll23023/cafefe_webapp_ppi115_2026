import { BaseModel } from './BaseModel.js';
import { CajaService } from '../control/CajaService.js';
import { Caja } from '../entity/Caja.js';

/**
 * Modelo de vista para Caja
 * @author MikeLB
 */
export class CajaModel extends BaseModel {
    constructor(tamanoPagina = 10) {
        super(new CajaService(), Caja, tamanoPagina);
    }
}