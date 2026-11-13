const test = require('node:test');
const assert = require('node:assert/strict');
const { cargar, fetchSimulado, json, ID } = require('../helpers/cargar');

const global = cargar(['entity/Uuid.js', 'entity/Entidades.js', 'entity/producto.js', 'control/DefaultDAO.js', 'control/ProductoDAO.js']);
const Producto = global('Producto');
const ProductoDAO = global('ProductoDAO');
const DefaultDAO = global('DefaultDAO');

const BASE = 'http://api.test/v1';
const crearDao = (respuestas) => {
  const fetchFn = fetchSimulado(respuestas);
  return { dao: new ProductoDAO({ baseUrl: BASE, fetchFn }), fetchFn };
};
const jsonProducto = { idProducto: ID, nombre: 'Americano', activo: true, comentarios: 'Café negro', precioSugerido: 2 };

test('findRange arma la URL, convierte a entidades y lee el total del encabezado', async () => {
  const { dao, fetchFn } = crearDao([json([jsonProducto], 200, { 'Total-Records': '12' })]);
  const { registros, total } = await dao.findRange(0, 10);
  assert.equal(fetchFn.llamadas[0].url, `${BASE}/producto?first=0&max=10`);
  assert.equal(registros.length, 1);
  assert.equal(registros[0] instanceof Producto, true);
  assert.equal(total, 12);
});

test('findRange usa la cantidad recibida si el encabezado del total no viene', async () => {
  const { dao } = crearDao([json([jsonProducto, jsonProducto])]);
  assert.equal((await dao.findRange(0, 10)).total, 2);
});

test('findRange rechaza parámetros fuera de rango sin llamar al servidor', async () => {
  const { dao, fetchFn } = crearDao([]);
  await assert.rejects(dao.findRange(-1, 10), { name: 'RangeError' });
  await assert.rejects(dao.findRange(0, 51), { name: 'RangeError' });
  await assert.rejects(dao.findRange(0, 0), { name: 'RangeError' });
  assert.equal(fetchFn.llamadas.length, 0);
});

test('findById devuelve la entidad y valida el UUID', async () => {
  const { dao, fetchFn } = crearDao([json(jsonProducto)]);
  const p = await dao.findById(ID.toUpperCase());
  assert.equal(fetchFn.llamadas[0].url, `${BASE}/producto/${ID}`);
  assert.equal(p.nombre, 'Americano');
  await assert.rejects(dao.findById('abc'), { name: 'TypeError' });
});

test('findById traduce un 404 en ApiError con el mensaje del encabezado', async () => {
  const { dao } = crearDao([new Response(null, { status: 404, headers: { 'Not-Found': `id: ${ID}` } })]);
  await assert.rejects(dao.findById(ID), { name: 'ApiError', status: 404, message: `id: ${ID}` });
});

test('crear envía POST con el cuerpo de ProductoRequest y devuelve el id de Location', async () => {
  const location = `${BASE}/producto/${ID}`;
  const { dao, fetchFn } = crearDao([new Response(null, { status: 201, headers: { Location: location } })]);
  const resultado = await dao.crear(new Producto({ nombre: ' Mocha ', precioSugerido: 4 }), { tiposProducto: ['Bebida'] });
  const { opciones } = fetchFn.llamadas[0];
  assert.equal(opciones.method, 'POST');
  assert.equal(opciones.headers['Content-Type'], 'application/json');
  const cuerpo = JSON.parse(opciones.body);
  assert.equal(cuerpo.nombre, 'Mocha');
  assert.equal(cuerpo.tiposProducto[0], 'Bebida');
  assert.equal(resultado.id, ID);
});

test('crear con una entidad inválida lanza ValidacionError y no llama al servidor', async () => {
  const { dao, fetchFn } = crearDao([]);
  await assert.rejects(dao.crear(new Producto({ nombre: '', precioSugerido: 99 })), { name: 'ValidacionError' });
  assert.equal(fetchFn.llamadas.length, 0);
});

test('modificar envía PUT y devuelve la entidad actualizada', async () => {
  const { dao, fetchFn } = crearDao([json({ ...jsonProducto, nombre: 'Doble' })]);
  const p = await dao.modificar(ID, new Producto({ nombre: 'Doble', precioSugerido: 3 }));
  assert.equal(fetchFn.llamadas[0].opciones.method, 'PUT');
  assert.equal(p.nombre, 'Doble');
});

test('eliminar devuelve true y propaga el 409 con el mensaje del cuerpo', async () => {
  let { dao, fetchFn } = crearDao([new Response(null, { status: 204 })]);
  assert.equal(await dao.eliminar(ID), true);
  assert.equal(fetchFn.llamadas[0].opciones.method, 'DELETE');

  ({ dao } = crearDao([json({ error: 'Asociado a 2 orden(es)' }, 409)]));
  await assert.rejects(dao.eliminar(ID), { name: 'ApiError', status: 409, message: 'Asociado a 2 orden(es)' });
});

test('findById prefiere el mensaje del cuerpo (con tildes) al del encabezado (sin tildes)', async () => {
  const { dao } = crearDao([json({ error: 'Parámetro inválido' }, 400, { 'Wrong-Parameter': 'Parametro invalido' })]);
  await assert.rejects(dao.findById(ID), { name: 'ApiError', status: 400, message: 'Parámetro inválido' });
});

test('una falla de red se informa como ApiError con estado 0', async () => {
  const { dao } = crearDao([new Error('offline')]);
  await assert.rejects(dao.findById(ID), { name: 'ApiError', status: 0 });
});

test('desdeEndpoint separa recurso e identificador y resuelve la entidad', () => {
  const { dao, id } = DefaultDAO.desdeEndpoint(`/producto/${ID}`);
  assert.equal(id, ID);
  assert.equal(dao.entidad, Producto);
  assert.equal(DefaultDAO.desdeEndpoint('producto').id, null);
  assert.throws(() => DefaultDAO.desdeEndpoint(''), { name: 'TypeError' });
});
