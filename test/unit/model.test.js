const test = require('node:test');
const assert = require('node:assert/strict');
const { cargar } = require('../helpers/cargar');

const Model = cargar(['boundary/Model.js'])('Model');

test('requiere un DAO', () => {
  assert.throws(() => new Model(null), { name: 'TypeError' });
});

test('cargarRango pasa por cargando y termina en listo con los registros', async () => {
  const dao = { findRange: async () => ({ registros: [{ a: 1 }, { a: 2 }], total: 9 }) };
  const modelo = new Model(dao);
  const estados = [];
  modelo.addEventListener('cambio', (e) => estados.push(e.detail.estado));
  await modelo.cargarRango(0, 2);
  assert.deepEqual(estados, ['cargando', 'listo']);
  assert.equal(modelo.registros.length, 2);
  assert.equal(modelo.total, 9);
});

test('cargarUno deja un único registro', async () => {
  const modelo = new Model({ findById: async (id) => ({ id }) });
  await modelo.cargarUno('x');
  assert.equal(modelo.registros[0].id, 'x');
  assert.equal(modelo.total, 1);
});

test('si el DAO falla, el modelo queda en error y conserva la causa', async () => {
  const causa = new Error('boom');
  const modelo = new Model({ findById: async () => { throw causa; } });
  await modelo.cargarUno('x');
  assert.equal(modelo.estado, 'error');
  assert.equal(modelo.error, causa);
  assert.equal(modelo.registros.length, 0);
});

test('solo la carga más reciente actualiza el estado', async () => {
  const esperas = [80, 5];
  const dao = {
    findById: (id) => new Promise((resolver) => setTimeout(() => resolver({ id }), esperas.shift()))
  };
  const modelo = new Model(dao);
  const lenta = modelo.cargarUno('vieja');
  const rapida = modelo.cargarUno('nueva');
  await Promise.all([lenta, rapida]);
  assert.equal(modelo.registros[0].id, 'nueva');
});
