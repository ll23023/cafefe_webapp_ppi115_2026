/**
 * Error producido por una respuesta HTTP no exitosa o por una falla de red.
 * El estado `0` indica que el servidor no pudo ser contactado.
 */
class ApiError extends Error {
  /**
   * @param {number} status Código HTTP (0 si no hubo respuesta).
   * @param {string} mensaje Mensaje legible para el usuario.
   * @param {unknown} [detalle] Causa original, si existe.
   */
  constructor(status, mensaje, detalle = null) {
    super(mensaje);
    this.name = 'ApiError';
    this.status = status;
    this.detalle = detalle;
  }
}

/** Error producido cuando una entidad no supera su validación local, antes de llamar al API. */
class ValidacionError extends Error {
  /** @param {Object<string,string>} errores Mapa campo → mensaje. */
  constructor(errores) {
    super(`Los datos no son válidos: ${Object.values(errores).join('; ')}`);
    this.name = 'ValidacionError';
    this.errores = errores;
  }
}

/**
 * DAO genérico que consume un recurso REST del backend.
 *
 * Una instancia queda ligada a un endpoint  y, opcionalmente,
 * a una clase de entidad que convierte el JSON en objetos del dominio.
 */
class DefaultDAO {
  /**
   * Dirección base del API: servidor Liberty + contexto de la aplicación + `@ApplicationPath`.
   * Debe ser absoluta mientras el frontend se sirva desde otro puerto (CORS).
   */
  static BASE_URL = 'http://localhost:9080/Cafefe/resources/v1';
  /**
   * Nombres de los encabezados de respuesta del backend, tomados del enum `ResponseHeaders`
   * (`TOTAL_RECORDS`/`TOTAL_REGISTROS` comparten el valor `Total-Records`).
   */
  static ENCABEZADOS = Object.freeze({
    total: 'Total-Records',
    errores: ['Violates-Business-Rules', 'Wrong-Parameter', 'Wrong-Param', 'Not-Found', 'App-Error', 'Process-Error']
  });
  /** Máximo de registros por página que acepta el backend. */
  static MAX_PAGINA = 50;

  #endpoint;
  #entidad;
  #baseUrl;
  #fetch;
  #encabezados;

  /**
   * @param {object} opciones
   * @param {string} opciones.endpoint Nombre del recurso (p. ej. `producto`).
   * @param {Function|null} [opciones.entidad] Clase con `desdeJSON(json)`.
   * @param {string} [opciones.baseUrl] Dirección base del API.
   * @param {Function|null} [opciones.fetchFn] Implementación de `fetch` (útil en pruebas).
   * @param {object} [opciones.encabezados] Nombres de encabezados del backend.
   */
  constructor({ endpoint, entidad = null, baseUrl = DefaultDAO.BASE_URL, fetchFn = null, encabezados = DefaultDAO.ENCABEZADOS } = {}) {
    if (!endpoint) {
      throw new TypeError('El endpoint es obligatorio');
    }
    this.#endpoint = String(endpoint).replace(/^\/+|\/+$/g, '');
    this.#entidad = entidad;
    this.#baseUrl = baseUrl.replace(/\/+$/, '');
    this.#fetch = fetchFn ?? ((...argumentos) => globalThis.fetch(...argumentos));
    this.#encabezados = encabezados;
  }

  /** @returns {Function|null} Clase de entidad asociada. */
  get entidad() {
    return this.#entidad;
  }

  /**
   * Crea un DAO a partir de un endpoint completo, p. ej. `producto/3f2b…`.
   * La entidad se resuelve con el registro `Entidades`.
   * @param {string} endpoint Recurso y, opcionalmente, identificador.
   * @param {object} [opciones] Opciones adicionales del constructor.
   * @returns {{dao: DefaultDAO, id: string|null}} DAO y identificador (o `null`).
   */
  static desdeEndpoint(endpoint, opciones = {}) {
    const partes = String(endpoint ?? '').split('/').filter(Boolean);
    if (partes.length === 0) {
      throw new TypeError('El endpoint es obligatorio');
    }
    const [ruta, id = null] = partes;
    return { dao: new DefaultDAO({ endpoint: ruta, entidad: Entidades.obtener(ruta), ...opciones }), id };
  }

  /**
   * Obtiene una página de registros.
   * @param {number} [first] Posición inicial (≥ 0).
   * @param {number} [max] Cantidad de registros (1 a 50).
   * @returns {Promise<{registros: Array, total: number}>}
   * @throws {RangeError} Si los parámetros están fuera de rango.
   * @throws {ApiError} Si el servidor responde con error.
   */
  async findRange(first = 0, max = DefaultDAO.MAX_PAGINA) {
    if (!Number.isInteger(first) || first < 0 || !Number.isInteger(max) || max < 1 || max > DefaultDAO.MAX_PAGINA) {
      throw new RangeError(`Parámetros inválidos: first ≥ 0 y max entre 1 y ${DefaultDAO.MAX_PAGINA}`);
    }
    const respuesta = await this.#solicitar(`${this.#url()}?first=${first}&max=${max}`);
    const registros = (await respuesta.json()).map((json) => this.#hidratar(json));
    const total = Number(respuesta.headers.get(this.#encabezados.total));
    return { registros, total: Number.isFinite(total) && total > 0 ? total : registros.length };
  }

  /**
   * Obtiene un registro por su identificador.
   * @param {string} id UUID del registro.
   * @returns {Promise<object>} Entidad encontrada.
   * @throws {TypeError} Si el identificador no es un UUID.
   * @throws {ApiError} Si no existe (404) o el servidor falla.
   */
  async findById(id) {
    const respuesta = await this.#solicitar(this.#url(Uuid.normalizar(id)));
    return this.#hidratar(await respuesta.json());
  }

  /**
   * Crea un registro.
   * @param {object} entidad Entidad a crear; si expone `validar()` se valida antes de enviar.
   * @param {object} [relaciones] Datos relacionados, entregados a `aSolicitud`.
   * @returns {Promise<{id: string|null, location: string|null}>} Identificador y URL del nuevo registro.
   * @throws {ValidacionError} Si la entidad no es válida.
   */
  async crear(entidad, relaciones = {}) {
    const respuesta = await this.#solicitar(this.#url(), { method: 'POST', body: this.#cuerpo(entidad, relaciones) });
    const location = respuesta.headers.get('Location');
    return { id: location ? location.split('/').filter(Boolean).pop() : null, location };
  }

  /**
   * Modifica un registro existente.
   * @param {string} id UUID del registro.
   * @param {object} entidad Entidad con los nuevos datos.
   * @param {object} [relaciones] Datos relacionados.
   * @returns {Promise<object>} Entidad actualizada.
   */
  async modificar(id, entidad, relaciones = {}) {
    const respuesta = await this.#solicitar(this.#url(Uuid.normalizar(id)), { method: 'PUT', body: this.#cuerpo(entidad, relaciones) });
    return this.#hidratar(await respuesta.json());
  }

  /**
   * Elimina un registro.
   * @param {string} id UUID del registro.
   * @returns {Promise<boolean>} `true` si se eliminó.
   * @throws {ApiError} Si el servidor lo impide (p. ej. 409 por reglas de negocio).
   */
  async eliminar(id) {
    await this.#solicitar(this.#url(Uuid.normalizar(id)), { method: 'DELETE' });
    return true;
  }

  #url(id = null) {
    return `${this.#baseUrl}/${this.#endpoint}${id ? `/${id}` : ''}`;
  }

  #hidratar(json) {
    return this.#entidad?.desdeJSON ? this.#entidad.desdeJSON(json) : json;
  }

  #cuerpo(entidad, relaciones) {
    const errores = entidad?.validar?.() ?? {};
    if (Object.keys(errores).length > 0) {
      throw new ValidacionError(errores);
    }
    return JSON.stringify(entidad?.aSolicitud ? entidad.aSolicitud(relaciones) : entidad);
  }

  async #solicitar(url, { method = 'GET', body } = {}) {
    const encabezados = { Accept: 'application/json' };
    if (body !== undefined) {
      encabezados['Content-Type'] = 'application/json';
    }
    let respuesta;
    try {
      respuesta = await this.#fetch(url, { method, headers: encabezados, body });
    } catch (causa) {
      throw new ApiError(0, 'No se pudo contactar con el servidor', causa);
    }
    if (!respuesta.ok) {
      throw await this.#errorDe(respuesta);
    }
    return respuesta;
  }

  // El cuerpo `{"error": ...}` conserva las tildes; el encabezado las pierde (RestResponses.ascii).
  // Por eso se prefiere el cuerpo y el encabezado queda como respaldo.
  async #errorDe(respuesta) {
    try {
      const cuerpo = await respuesta.json();
      if (cuerpo?.error) {
        return new ApiError(respuesta.status, cuerpo.error);
      }
    } catch {
      /* la respuesta no trae cuerpo JSON */
    }
    for (const nombre of this.#encabezados.errores) {
      const mensaje = respuesta.headers.get(nombre);
      if (mensaje) {
        return new ApiError(respuesta.status, mensaje);
      }
    }
    return new ApiError(respuesta.status, respuesta.statusText || `Error HTTP ${respuesta.status}`);
  }
}
