/**
 *
 * @author Mil
 */

import { OrdenProducto } from '../entity/OrdenProducto.js';
import { OrdenProductoService } from '../control/OrdenProductoService.js';
import { BaseModel } from './BaseModel.js';

export class OrdenProductoModel extends BaseModel {
  constructor(tamanioPagina = 20) {
    super({
      service: new OrdenProductoService(),
      EntityClass: OrdenProducto,
      max: tamanioPagina,
    });
    this.desde = 1;
    this.hasta = tamanioPagina;
  }

  async cargar(desde = this.desde, hasta = this.hasta) {
    this.cargando = true;
    this.limpiarMensajes();
    this.desde = desde;
    this.hasta = hasta;
    this.notificar();

    try {
      const { registros, total } = await this.service.findRange(desde, hasta);
      this.registros = registros;
      this.total = total;
      return registros;
    } catch (err) {
      this.error = err.message;
      throw err;
    } finally {
      this.cargando = false;
      this.notificar();
    }
  }

  async guardar() {
    if (!this.registro) return null;
    this.cargando = true;
    this.limpiarMensajes();
    this.notificar();

    try {
      const idCreado = await this.service.create(this.registro);
      this.registro = null;
      this.estado = 'NADA';
      await this.cargar(this.desde, this.hasta);
      return idCreado;
    } catch (err) {
      this.error = err.message;
      this.notificar();
      throw err;
    } finally {
      this.cargando = false;
      this.notificar();
    }
  }

  async modificar(id = this.registro?.idOrdenProducto) {
    if (!this.registro) return null;
    this.cargando = true;
    this.limpiarMensajes();
    this.notificar();

    try {
      const actualizado = await this.service.update(id, this.registro);
      this.registro = null;
      this.estado = 'NADA';
      await this.cargar(this.desde, this.hasta);
      return actualizado;
    } catch (err) {
      this.error = err.message;
      this.notificar();
      throw err;
    } finally {
      this.cargando = false;
      this.notificar();
    }
  }

  async eliminar(id) {
    this.cargando = true;
    this.limpiarMensajes();
    this.notificar();

    try {
      await this.service.delete(id);
      this.registro = null;
      this.estado = 'NADA';
      await this.cargar(this.desde, this.hasta);
      return true;
    } catch (err) {
      this.error = err.message;
      this.notificar();
      throw err;
    } finally {
      this.cargando = false;
      this.notificar();
    }
  }

  get hayAnterior() {
    return this.desde > 1;
  }

  get haySiguiente() {
    return this.registros.length === this.hasta - this.desde + 1;
  }

  async siguientePagina() {
    if (this.haySiguiente) {
      const paso = this.hasta - this.desde + 1;
      return this.cargar(this.hasta + 1, this.hasta + paso);
    }
  }

  async anteriorPagina() {
    if (this.hayAnterior) {
      const paso = this.hasta - this.desde + 1;
      const nuevoDesde = Math.max(1, this.desde - paso);
      return this.cargar(nuevoDesde, nuevoDesde + paso - 1);
    }
  }
}