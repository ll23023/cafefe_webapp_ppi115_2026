const test = require('node:test');
const assert = require('node:assert/strict');
const { cargar, ID } = require('../helpers/cargar');

const Uuid = cargar(['entity/Uuid.js'])('Uuid');

test('esValido acepta un UUID y rechaza texto, nulos y formatos incorrectos', () => {
  assert.equal(Uuid.esValido(ID), true);
  assert.equal(Uuid.esValido(`  ${ID.toUpperCase()} `), true);
  assert.equal(Uuid.esValido('123'), false);
  assert.equal(Uuid.esValido(null), false);
  assert.equal(Uuid.esValido(undefined), false);
  assert.equal(Uuid.esValido(42), false);
});

test('normalizar devuelve el UUID en minúsculas y sin espacios', () => {
  assert.equal(Uuid.normalizar(`  ${ID.toUpperCase()} `), ID);
});

test('normalizar lanza TypeError con un valor inválido', () => {
  assert.throws(() => Uuid.normalizar('no-es-uuid'), { name: 'TypeError' });
});

test('generar produce UUID válidos y distintos', () => {
  const a = Uuid.generar();
  const b = Uuid.generar();
  assert.equal(Uuid.esValido(a), true);
  assert.notEqual(a, b);
});
