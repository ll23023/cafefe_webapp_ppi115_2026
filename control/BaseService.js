/**
 * 
 * @author Mil
 */

import { ApiClient, ResponseHeaders } from './ApiClient.js';

export class BaseService {

  /**
   * @param {string} endpoint - Ruta exacta del @Path
   * @param {Function} EntityClass - Clase de entidad JS
   * @param {'first-max'|'desde-hasta'} [paginacion='first-max']
   */
  constructor(endpoint, EntityClass, paginacion = 'first-max') {
    this.endpoint = endpoint;
    this.EntityClass = EntityClass;
    this.paginacion = paginacion;
  }

  hidratar(item) {
    if (!this.EntityClass || item == null) return item;
    if (typeof this.EntityClass.desdeJSON === 'function') {
      return this.EntityClass.desdeJSON(item);
    }
    return new this.EntityClass(item);
  }

  /**
   * Permite pasar tanto un UUID en string como el objeto entidad completo (ej. factura o factura.idFactura)
   */
  static extraerUuid(valor, campoId) {
    if (!valor) return null;
    if (typeof valor === 'string') return valor;
    if (typeof valor === 'object') return valor[campoId] ?? null;
    return null;
  }

  async findRange(inicio = 0, limite = 50, extraParams = {}) {
    const params = new URLSearchParams();

    if (this.paginacion === 'desde-hasta') {
      params.set('desde', inicio);
      params.set('hasta', limite);
    } else {
      params.set('first', inicio);
      params.set('max', limite);
    }

    for (const [clave, valor] of Object.entries(extraParams)) {
      if (valor !== null && valor !== undefined && valor !== '') {
        params.set(clave, valor);
      }
    }

    const res = await ApiClient.request(`/${this.endpoint}?${params.toString()}`);
    const data = await res.json();
    const totalHeader = res.headers.get(ResponseHeaders.TOTAL_RECORDS);

    return {
      registros: data.map((item) => this.hidratar(item)),
      total: totalHeader !== null ? Number(totalHeader) : data.length,
    };
  }

  async findById(id) {
    const res = await ApiClient.request(`/${this.endpoint}/${id}`);
    return this.hidratar(await res.json());
  }

  async create(payload) {
    const res = await ApiClient.request(`/${this.endpoint}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return ApiClient.extraerIdDeLocation(res);
  }

  async update(id, payload) {
    const res = await ApiClient.request(`/${this.endpoint}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return this.hidratar(await res.json());
  }

  async delete(id) {
    await ApiClient.request(`/${this.endpoint}/${id}`, { method: 'DELETE' });
  }
}