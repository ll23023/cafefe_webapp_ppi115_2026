import { Producto } from '../entity/Producto.js';
import { ProductoService } from '../control/ProductoService.js';
import { BaseModel } from './BaseModel.js';

/**
 *
 * @author Mil
 */

export class ProductoModel extends BaseModel {
  constructor(max = 10) {
    super({
      service: new ProductoService(),
      EntityClass: Producto,
      max,
    });
    this.relaciones = {
      caracteristicas: [],
      tiposProducto: [],
      descuentos: [],
    };
  }

  nuevo(valoresIniciales = {}) {
    this.relaciones = { caracteristicas: [], tiposProducto: [], descuentos: [] };
    return super.nuevo(valoresIniciales);
  }

  async guardar(relaciones = this.relaciones) {
    return super.guardar(relaciones);
  }

  async modificar(id = this.registro?.idProducto, relaciones = this.relaciones) {
    return super.modificar(id, relaciones);
  }
}