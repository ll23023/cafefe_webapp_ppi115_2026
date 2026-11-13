/**
 * No agrega lógica: solo fija el endpoint y la entidad sobre `DefaultDAO`.
 */
class ProductoDAO extends DefaultDAO {
  /** @param {object} [opciones] Opciones de `DefaultDAO` (baseUrl, fetchFn, etc.). */
  constructor(opciones = {}) {
    super({ endpoint: Producto.ENDPOINT, entidad: Producto, ...opciones });
  }
}
