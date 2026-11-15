import { Producto } from '../entity/Producto.js';
import { BaseService } from './BaseService.js';

/**
 *
 * @author Mil
 */

export class ProductoService extends BaseService {
  constructor() {
    super('producto', Producto, 'first-max');
  }

  async create(producto, relaciones = {}) {
    const body =
      typeof producto.aSolicitud === 'function'
        ? producto.aSolicitud(relaciones)
        : producto;
    return super.create(body);
  }

  async update(id, producto, relaciones = {}) {
    const body =
      typeof producto.aSolicitud === 'function'
        ? producto.aSolicitud(relaciones)
        : producto;
    return super.update(id, body);
  }
}