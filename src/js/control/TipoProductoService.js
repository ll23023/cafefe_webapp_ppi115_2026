import { BaseService } from './BaseService.js';
import { TipoProducto } from '../entity/TipoProducto.js';

/**
 * Servicio REST para TipoProducto
 * @author MikeLB
 */
export class TipoProductoService extends BaseService {
    constructor() {
        super(TipoProducto.ENDPOINT, TipoProducto, 'desde-hasta');
    }

    async findAll(limite = 50) {
        const registros = [];
        let total = Number.POSITIVE_INFINITY;

        while (registros.length < total) {
            const pagina = await this.findRange(registros.length, limite);
            registros.push(...pagina.registros);
            total = pagina.total;

            if (pagina.registros.length < limite || registros.length >= total) break;
        }

        return { registros, total: registros.length };
    }
}