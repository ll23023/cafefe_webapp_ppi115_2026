import { BaseModel } from './BaseModel.js';
import { TipoCaracteristicaService } from '../control/TipoCaracteristicaService.js';
import { TipoCaracteristica } from '../entity/TipoCaracteristica.js';

/**
 * Modelo de vista para TipoCaracteristica
 * @author MikeLB
 */
export class TipoCaracteristicaModel extends BaseModel {
    constructor(tamanoPagina = 10) {
        super(new TipoCaracteristicaService(), TipoCaracteristica, tamanoPagina);
    }
}