import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';
import { Session } from '../src/js/control/Session.js';

const descriptorNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
const descriptorSessionStorage = Object.getOwnPropertyDescriptor(globalThis, 'sessionStorage');
const fetchOriginal = globalThis.fetch;

beforeEach(() => {
  const valores = new Map();
  Object.defineProperty(globalThis, 'sessionStorage', {
    configurable: true,
    value: {
      getItem: (clave) => valores.get(clave) ?? null,
      setItem: (clave, valor) => valores.set(clave, String(valor)),
      removeItem: (clave) => valores.delete(clave),
    },
  });
});

afterEach(() => {
  globalThis.fetch = fetchOriginal;
  if (descriptorNavigator) Object.defineProperty(globalThis, 'navigator', descriptorNavigator);
  else delete globalThis.navigator;
  if (descriptorSessionStorage) Object.defineProperty(globalThis, 'sessionStorage', descriptorSessionStorage);
  else delete globalThis.sessionStorage;
});

test('no inicia sesión si el navegador no tiene conexión', async () => {
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { onLine: false } });
  globalThis.fetch = async () => {
    throw new Error('fetch no debe ejecutarse sin conexión');
  };

  await assert.rejects(Session.iniciar('Cliente'), /No hay conexión a internet/);
});

test('no inicia sesión cuando la API no responde', async () => {
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { onLine: true } });
  globalThis.fetch = async () => {
    throw new TypeError('network down');
  };

  await assert.rejects(Session.iniciar('Cliente'), /network down/);
  assert.equal(Session.leer(), null);
});

test('permite el login de cliente después de validar la API', async () => {
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { onLine: true } });
  globalThis.fetch = async (_url, options) => {
    assert.equal(options.method, undefined);
    return new Response('[]', {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Total-Records': '0' },
    });
  };

  const sesion = await Session.iniciar('Cliente');

  assert.equal(sesion.tipo, 'cliente');
  assert.equal(Session.leer().nombre, 'Cliente');
});
