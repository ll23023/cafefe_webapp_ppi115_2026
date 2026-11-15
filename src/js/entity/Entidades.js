/**
 * Registro de entidades del frontend.
 *
 * Funciona como el "diccionario de endpoints" del proyecto: asocia el nombre del
 * endpoint REST (por ejemplo, `producto`) con la clase JavaScript que lo representa.
 * Gracias a este registro, componentes genéricos como la tarjeta pueden construir la
 * entidad correcta a partir únicamente del endpoint recibido.
 */
class Entidades {
  static #registro = new Map();

  /**
   * Registra una entidad bajo el nombre de su endpoint.
   * @param {string} endpoint Nombre del recurso REST (sin barras).
   * @param {Function} clase Clase de la entidad; debe exponer `desdeJSON(json)`.
   */
  static registrar(endpoint, clase) {
    Entidades.#registro.set(String(endpoint).toLowerCase(), clase);
  }

  /**
   * Obtiene la clase asociada a un endpoint.
   * @param {string} endpoint Nombre del recurso REST.
   * @returns {Function|null} La clase registrada o `null` si no existe.
   */
  static obtener(endpoint) {
    return Entidades.#registro.get(String(endpoint).toLowerCase()) ?? null;
  }
}
