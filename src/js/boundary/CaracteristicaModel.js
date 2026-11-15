import { BaseModel } from './BaseModel.js';
import { CaracteristicaService } from '../control/CaracteristicaService.js';
import { Caracteristica } from '../entity/Caracteristica.js';

/**
 * Modelo de vista para Caracteristica
 * @author MikeLB
 */
export class CaracteristicaModel extends BaseModel {
    constructor(tamanoPagina = 10) {
        super({
            service: new CaracteristicaService(),
            EntityClass: Caracteristica,
            max: tamanoPagina,
        });
    }
}