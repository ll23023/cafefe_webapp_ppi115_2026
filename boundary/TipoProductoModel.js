import { BaseModel } from './BaseModel.js';
import { TipoProductoService } from '../control/TipoProductoService.js';
import { TipoProducto } from '../entity/TipoProducto.js';

/**
 * Modelo de vista para TipoProducto
 * @author MikeLB
 */
export class TipoProductoModel extends BaseModel {
    constructor(tamanoPagina = 10) {
        super(new TipoProductoService(), TipoProducto, tamanoPagina);
    }
}