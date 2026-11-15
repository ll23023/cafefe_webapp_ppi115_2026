import { BaseModel } from './BaseModel.js';
import { TipoDescuentoService } from '../control/TipoDescuentoService.js';
import { TipoDescuento } from '../entity/TipoDescuento.js';

/**
 * Modelo de vista para TipoDescuento
 * @author MikeLB
 */
export class TipoDescuentoModel extends BaseModel {
    constructor(tamanoPagina = 10) {
        super(new TipoDescuentoService(), TipoDescuento, tamanoPagina);
    }
}