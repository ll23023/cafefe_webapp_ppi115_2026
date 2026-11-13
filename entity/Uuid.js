class Uuid {
  static #PATRON = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  /**
   * Determina si el valor recibido es una cadena con formato de UUID.
   * @param {unknown} valor Valor a evaluar.
   * @returns {boolean} `true` si el formato es válido.
   */
  static esValido(valor) {
    return typeof valor === 'string' && Uuid.#PATRON.test(valor.trim());
  }

  /**
   * Devuelve el UUID en minúsculas y sin espacios laterales.
   * @param {string} valor UUID a normalizar.
   * @returns {string} UUID normalizado.
   * @throws {TypeError} Si el valor no tiene formato de UUID.
   */
  static normalizar(valor) {
    if (!Uuid.esValido(valor)) {
      throw new TypeError(`UUID inválido: ${valor}`);
    }
    return valor.trim().toLowerCase();
  }

  /**
   * Genera un UUID aleatorio (versión 4).
   * @returns {string} Nuevo UUID.
   */
  static generar() {
    return globalThis.crypto.randomUUID();
  }
}
