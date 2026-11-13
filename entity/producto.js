class Producto {
  static ENDPOINT = 'producto';
  static NOMBRE_MAX = 155;
  static PRECIO_MIN = 0;
  static PRECIO_MAX = 50;
  /** Campos que un componente genérico (la tarjeta) utiliza para presentar la entidad. */
  static CAMPOS_TARJETA = Object.freeze({ titulo: 'nombre', descripcion: 'comentarios', imagen: null, precio: 'precioSugerido' });

  /**
   * @param {object} [datos]
   * @param {string|null} [datos.idProducto] Identificador UUID.
   * @param {string} [datos.nombre] Nombre del producto.
   * @param {boolean} [datos.activo] Indica si el producto está activo.
   * @param {string} [datos.comentarios] Comentarios u observaciones.
   * @param {number|null} [datos.precioSugerido] Precio sugerido.
   */
  constructor({ idProducto = null, nombre = '', activo = true, comentarios = '', precioSugerido = 0 } = {}) {
    this.idProducto = idProducto;
    this.nombre = nombre;
    this.activo = activo;
    this.comentarios = comentarios;
    this.precioSugerido = precioSugerido;
  }

  /**
   * Construye un `Producto` a partir del JSON devuelto por el API.
   * @param {object} json Objeto JSON del recurso.
   * @returns {Producto} Instancia correspondiente.
   * @throws {TypeError} Si no se recibe un objeto.
   */
  static desdeJSON(json) {
    if (json === null || typeof json !== 'object') {
      throw new TypeError('Se esperaba un objeto JSON de producto');
    }
    return new Producto({
      idProducto: Uuid.esValido(json.idProducto) ? Uuid.normalizar(json.idProducto) : null,
      nombre: json.nombre ?? '',
      activo: json.activo ?? true,
      comentarios: json.comentarios ?? '',
      precioSugerido: json.precioSugerido == null ? null : Number(json.precioSugerido)
    });
  }

  /**
   * Valida la entidad con las mismas reglas que aplica el backend.
   * @returns {Object<string,string>} Mapa campo → mensaje; vacío si la entidad es válida.
   */
  validar() {
    const errores = {};
    const nombre = typeof this.nombre === 'string' ? this.nombre.trim() : '';
    if (nombre === '') {
      errores.nombre = 'El nombre es obligatorio';
    } else if (nombre.length > Producto.NOMBRE_MAX) {
      errores.nombre = `El nombre no puede exceder ${Producto.NOMBRE_MAX} caracteres`;
    }
    const precio = this.precioSugerido;
    if (precio === null || precio === undefined || Number.isNaN(Number(precio))) {
      errores.precioSugerido = 'El precio es obligatorio';
    } else if (precio < Producto.PRECIO_MIN || precio > Producto.PRECIO_MAX) {
      errores.precioSugerido = `El precio debe estar entre ${Producto.PRECIO_MIN} y ${Producto.PRECIO_MAX}`;
    }
    return errores;
  }

  /** @returns {boolean} `true` si la entidad no presenta errores de validación. */
  esValido() {
    return Object.keys(this.validar()).length === 0;
  }

  /** @returns {object} Representación JSON con los campos propios de la entidad. */
  toJSON() {
    return {
      idProducto: this.idProducto,
      nombre: this.nombre,
      activo: this.activo,
      comentarios: this.comentarios,
      precioSugerido: this.precioSugerido
    };
  }

  /**
   * Construye el cuerpo que espera el backend en POST y PUT (clase `ProductoRequest`).
   * El identificador se omite porque el servidor lo genera.
   * @param {object} [relaciones]
   * @param {Array<{tipo:string,nombre:string,valor:string}>} [relaciones.caracteristicas]
   * @param {string[]} [relaciones.tiposProducto] Nombres de los tipos de producto.
   * @param {Array<{tipoDescuento:string,nombre:string,valor:number,fechaDesde?:string,fechaHasta?:string}>} [relaciones.descuentos]
   * @returns {object} Cuerpo de la solicitud.
   */
  aSolicitud({ caracteristicas = [], tiposProducto = [], descuentos = [] } = {}) {
    return {
      nombre: String(this.nombre ?? '').trim(),
      activo: this.activo,
      comentarios: this.comentarios ?? '',
      precioSugerido: this.precioSugerido,
      caracteristicas,
      tiposProducto,
      descuentos
    };
  }
}

Entidades.registrar(Producto.ENDPOINT, Producto);