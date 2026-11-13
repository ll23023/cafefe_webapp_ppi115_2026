const test = require('node:test');
const assert = require('node:assert/strict');
const { cargar, ID } = require('../helpers/cargar');

const global = cargar(['entity/Uuid.js', 'entity/Entidades.js', 'entity/producto.js']);
const Producto = global('Producto');
const Entidades = global('Entidades');

const valido = () => new Producto({ idProducto: ID, nombre: 'Americano', comentarios: 'Café negro', precioSugerido: 2 });

test('desdeJSON construye la entidad con los campos del API', () => {
  const p = Producto.desdeJSON({ idProducto: ID.toUpperCase(), nombre: 'Latte', activo: false, comentarios: 'Con leche', precioSugerido: '3.50' });
  assert.equal(p.idProducto, ID);
  assert.equal(p.nombre, 'Latte');
  assert.equal(p.activo, false);
  assert.equal(p.precioSugerido, 3.5);
});

test('desdeJSON rechaza valores que no son objetos', () => {
  assert.throws(() => Producto.desdeJSON(null), { name: 'TypeError' });
  assert.throws(() => Producto.desdeJSON('texto'), { name: 'TypeError' });
});

test('validar acepta un producto correcto, incluidos los límites del precio', () => {
  assert.equal(valido().esValido(), true);
  assert.equal(new Producto({ nombre: 'X', precioSugerido: 0 }).esValido(), true);
  assert.equal(new Producto({ nombre: 'X', precioSugerido: 50 }).esValido(), true);
});

test('validar exige nombre y limita su longitud a 155', () => {
  assert.ok(new Producto({ nombre: '   ', precioSugerido: 1 }).validar().nombre);
  assert.ok(new Producto({ nombre: 'a'.repeat(156), precioSugerido: 1 }).validar().nombre);
  assert.equal(new Producto({ nombre: 'a'.repeat(155), precioSugerido: 1 }).esValido(), true);
});

test('validar exige un precio entre 0 y 50', () => {
  assert.ok(new Producto({ nombre: 'X', precioSugerido: -0.01 }).validar().precioSugerido);
  assert.ok(new Producto({ nombre: 'X', precioSugerido: 50.01 }).validar().precioSugerido);
  assert.ok(new Producto({ nombre: 'X', precioSugerido: null }).validar().precioSugerido);
});

test('aSolicitud omite el id, recorta el nombre e incluye las relaciones vacías por defecto', () => {
  const cuerpo = new Producto({ idProducto: ID, nombre: '  Mocha ', precioSugerido: 4 }).aSolicitud();
  assert.equal(cuerpo.nombre, 'Mocha');
  assert.equal('idProducto' in cuerpo, false);
  assert.equal(cuerpo.caracteristicas.length, 0);
  assert.equal(cuerpo.tiposProducto.length, 0);
  assert.equal(cuerpo.descuentos.length, 0);
});

test('toJSON expone solo los campos propios', () => {
  assert.deepEqual(Object.keys(valido().toJSON()), ['idProducto', 'nombre', 'activo', 'comentarios', 'precioSugerido']);
});

test('la entidad queda registrada bajo el endpoint "producto"', () => {
  assert.equal(Entidades.obtener('producto'), Producto);
  assert.equal(Entidades.obtener('PRODUCTO'), Producto);
  assert.equal(Entidades.obtener('inexistente'), null);
});
