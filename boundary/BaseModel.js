/**
 *
 * @author Mil
 */

export class BaseModel {
  /**
   * @param {object} opciones
   * @param {object} opciones.service - Instancia del *Service correspondiente
   * @param {Function} opciones.EntityClass - Clase de entidad JS
   * @param {number} [opciones.max=10] - Tamaño de página por defecto
   */
  constructor({ service, EntityClass, max = 10 }) {
    this.service = service;
    this.EntityClass = EntityClass;

    // Estado de datos y UI
    this.registros = [];
    this.registro = null;
    this.total = 0;
    this.first = 0;
    this.max = max;
    this.estado = 'NADA'; // 'NADA' | 'CREAR' | 'MODIFICAR'
    this.cargando = false;
    this.error = null;
    this.erroresValidacion = {};

    this.#listeners = new Set();
  }

  #listeners;

  /**
   * Permite que una vista o Web Component escuche cambios en el modelo.
   * @param {(modelo: BaseModel) => void} listener
   * @returns {() => void} Función para cancelar la suscripción
   */
  suscribir(listener) {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  notificar() {
    for (const listener of this.#listeners) {
      listener(this);
    }
  }

  limpiarMensajes() {
    this.error = null;
    this.erroresValidacion = {};
  }

  async cargar(first = this.first, max = this.max, extraParams = {}) {
    this.cargando = true;
    this.limpiarMensajes();
    this.first = first;
    this.max = max;
    this.notificar();

    try {
      const { registros, total } = await this.service.findRange(first, max, extraParams);
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

  async seleccionar(id) {
    this.cargando = true;
    this.limpiarMensajes();
    this.notificar();

    try {
      this.registro = await this.service.findById(id);
      this.estado = 'MODIFICAR';
      return this.registro;
    } catch (err) {
      this.error = err.message;
      throw err;
    } finally {
      this.cargando = false;
      this.notificar();
    }
  }

  nuevo(valoresIniciales = {}) {
    this.limpiarMensajes();
    this.registro = new this.EntityClass(valoresIniciales);
    this.estado = 'CREAR';
    this.notificar();
    return this.registro;
  }

  cancelar() {
    this.limpiarMensajes();
    this.registro = null;
    this.estado = 'NADA';
    this.notificar();
  }

  #validarRegistro() {
    if (typeof this.registro?.validar === 'function') {
      const errores = this.registro.validar();
      if (Object.keys(errores).length > 0) {
        this.erroresValidacion = errores;
        this.error = 'Revise los campos marcados antes de continuar.';
        this.notificar();
        return false;
      }
    }
    return true;
  }

  async guardar(extra = undefined) {
    if (!this.registro) return null;
    this.limpiarMensajes();
    if (!this.#validarRegistro()) return null;

    this.cargando = true;
    this.notificar();

    try {
      const idCreado = await this.service.create(this.registro, extra);
      this.registro = null;
      this.estado = 'NADA';
      await this.cargar(this.first, this.max);
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

  async modificar(id, extra = undefined) {
    if (!this.registro) return null;
    this.limpiarMensajes();
    if (!this.#validarRegistro()) return null;

    this.cargando = true;
    this.notificar();

    try {
      const actualizado = await this.service.update(id, this.registro, extra);
      this.registro = null;
      this.estado = 'NADA';
      await this.cargar(this.first, this.max);
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
      if (this.registro) {
        this.registro = null;
        this.estado = 'NADA';
      }
      // Si se borró el último registro de una página que no es la primera, retrocede
      const nuevoFirst =
        this.registros.length === 1 && this.first >= this.max
          ? this.first - this.max
          : this.first;
      await this.cargar(nuevoFirst, this.max);
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
    return this.first > 0;
  }

  get haySiguiente() {
    return this.first + this.max < this.total;
  }

  async siguientePagina() {
    if (this.haySiguiente) {
      return this.cargar(this.first + this.max, this.max);
    }
  }

  async anteriorPagina() {
    if (this.hayAnterior) {
      return this.cargar(Math.max(0, this.first - this.max), this.max);
    }
  }
}