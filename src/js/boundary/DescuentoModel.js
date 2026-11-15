import { BaseModel } from './BaseModel.js';
import { DescuentoService } from '../control/DescuentoService.js';
import { Descuento } from '../entity/Descuento.js';

/**
 * Modelo de vista para Descuento
 * @author MikeLB
 */
export class DescuentoModel extends BaseModel {
    constructor(tamanoPagina = 10) {
        super({
            service: new DescuentoService(),
            EntityClass: Descuento,
            max: tamanoPagina,
        });
    }

    async cargar(first = this.first, max = this.max) {
        return super.cargar(first, max, this.filtros ?? {});
    }

    async cargarPorTipoDescuento(idTipoDescuento) {
        this.filtros = idTipoDescuento ? { idTipoDescuento } : {};
        return this.cargar();
    }
}