/**
 * Modelo genérico de la capa boundary.
 *
 * Intermedia entre un componente visual y un DAO: conserva el estado de la carga
 * (`inactivo`, `cargando`, `listo`, `error`) y los registros obtenidos, y emite el
 * evento `cambio` cada vez que el estado se modifica. Si se inician varias cargas
 * consecutivas, únicamente la más reciente actualiza el estado.
 */
class Model extends EventTarget {
  static ESTADOS = Object.freeze({ INACTIVO: 'inactivo', CARGANDO: 'cargando', LISTO: 'listo', ERROR: 'error' });

  #dao;
  #estado = Model.ESTADOS.INACTIVO;
  #registros = [];
  #total = 0;
  #error = null;
  #peticion = 0;

  /** @param {DefaultDAO} dao DAO mediante el cual se obtienen los datos. */
  constructor(dao) {
    super();
    if (!dao) {
      throw new TypeError('El DAO es obligatorio');
    }
    this.#dao = dao;
  }

  get estado() { return this.#estado; }
  get registros() { return [...this.#registros]; }
  get total() { return this.#total; }
  get error() { return this.#error; }

  /**
   * Carga una página de registros.
   * @param {number} [first] Posición inicial.
   * @param {number} [max] Cantidad de registros.
   */
  async cargarRango(first = 0, max = 50) {
    await this.#ejecutar(async () => this.#dao.findRange(first, max));
  }

  /**
   * Carga un único registro por su identificador.
   * @param {string} id UUID del registro.
   */
  async cargarUno(id) {
    await this.#ejecutar(async () => {
      const registro = await this.#dao.findById(id);
      return { registros: [registro], total: 1 };
    });
  }

  async #ejecutar(operacion) {
    const peticion = ++this.#peticion;
    this.#error = null;
    this.#cambiar(Model.ESTADOS.CARGANDO);
    try {
      const { registros, total } = await operacion();
      if (peticion !== this.#peticion) return;
      this.#registros = registros;
      this.#total = total;
      this.#cambiar(Model.ESTADOS.LISTO);
    } catch (error) {
      if (peticion !== this.#peticion) return;
      this.#registros = [];
      this.#total = 0;
      this.#error = error;
      this.#cambiar(Model.ESTADOS.ERROR);
    }
  }

  #cambiar(estado) {
    this.#estado = estado;
    this.dispatchEvent(new CustomEvent('cambio', { detail: { estado, error: this.#error } }));
  }
}