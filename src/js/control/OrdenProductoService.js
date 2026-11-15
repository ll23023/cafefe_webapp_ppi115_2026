import { OrdenProducto } from '../entity/OrdenProducto.js';
import { BaseService } from './BaseService.js';

/**
 *
 * @author Mil
 */

export class OrdenProductoService extends BaseService {

  constructor() {
    super('orden_producto', OrdenProducto, 'desde-hasta');
  }

  async findRange(desde = 1, hasta = 50) {
    return super.findRange(desde, hasta);
  }

  #prepararEntidad(datos) {
    const idOrden = BaseService.extraerUuid(datos.idOrden, 'idOrden');
    const idProducto = BaseService.extraerUuid(datos.idProducto, 'idProducto');

    return {
      precio: datos.precio ?? null,
      observaciones: datos.observaciones ?? '',
      idOrden: idOrden ? { idOrden } : null,
      idProducto: idProducto ? { idProducto } : null,
    };
  }

  async create(datos) {
    return super.create(this.#prepararEntidad(datos));
  }

  async update(id, datos) {
    return super.update(id, this.#prepararEntidad(datos));
  }
  
}