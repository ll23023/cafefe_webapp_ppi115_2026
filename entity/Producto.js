/**
 *
 * @author Mil
 */

export class Producto {
  static ENDPOINT = 'producto';
  static NOMBRE_MAX = 155;
  static PRECIO_MIN = 0;
  static PRECIO_MAX = 50;

  constructor({ idProducto = null, nombre = '', activo = true, comentarios = '', precioSugerido = 0 } = {}) {
    this.idProducto = idProducto;
    this.nombre = nombre;
    this.activo = activo;
    this.comentarios = comentarios;
    this.precioSugerido = precioSugerido;
  }

  static desdeJSON(json) {
    if (json === null || typeof json !== 'object') {
      throw new TypeError('Se esperaba un objeto JSON de producto');
    }
    return new Producto({
      idProducto: json.idProducto ?? null,
      nombre: json.nombre ?? '',
      activo: json.activo ?? true,
      comentarios: json.comentarios ?? '',
      precioSugerido: json.precioSugerido == null ? null : Number(json.precioSugerido),
    });
  }

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

  esValido() {
    return Object.keys(this.validar()).length === 0;
  }

  aSolicitud({ caracteristicas = [], tiposProducto = [], descuentos = [] } = {}) {
    return {
      nombre: String(this.nombre ?? '').trim(),
      activo: this.activo,
      comentarios: this.comentarios ?? '',
      precioSugerido: this.precioSugerido,
      caracteristicas,
      tiposProducto,
      descuentos,
    };
  }
}