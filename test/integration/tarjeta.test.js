// Prueba de integración de la tarjeta y su AddButton en un DOM simulado.
// Requiere jsdom; si no está instalado, la prueba se omite.
const test = require('node:test');
const assert = require('node:assert/strict');
const { leer, fetchSimulado, json, ID } = require('../helpers/cargar');

let JSDOM = null;
try { ({ JSDOM } = require('jsdom')); } catch { /* jsdom no instalado */ }

const SCRIPTS = ['entity/Uuid.js', 'entity/Entidades.js', 'entity/producto.js', 'control/DefaultDAO.js',
  'boundary/Model.js', 'boundary/components/botonAgregar/botonAgregar.js', 'boundary/components/tarjeta/tarjeta.js'];
const PLANTILLAS = ['boundary/components/botonAgregar/botonAgregar.html', 'boundary/components/tarjeta/tarjeta.html'];

const esperar = () => new Promise((resolver) => setTimeout(resolver, 20));

function crearPagina(respuestas) {
  const dom = new JSDOM('<!DOCTYPE html><body></body>', { runScripts: 'dangerously', url: 'http://localhost/' });
  const { window } = dom;
  window.fetch = fetchSimulado(respuestas);
  window.document.body.innerHTML = PLANTILLAS.map(leer).join('\n');
  for (const archivo of SCRIPTS) {
    const script = window.document.createElement('script');
    script.textContent = leer(archivo);
    window.document.head.appendChild(script);
  }
  return window;
}

const datos = { idProducto: ID, nombre: 'Americano', activo: true, comentarios: 'Café negro', precioSugerido: 2 };

test('la tarjeta consume el endpoint y cumple la estructura del diseño', { skip: !JSDOM && 'jsdom no instalado' }, async () => {
  const window = crearPagina([json(datos)]);
  const tarjeta = window.document.createElement('custom-tarjeta');
  tarjeta.setAttribute('endpoint', `producto/${ID}`);
  window.document.body.appendChild(tarjeta);
  await esperar();

  assert.equal(tarjeta instanceof window.HTMLElement, true);
  assert.ok(tarjeta.querySelector('div'));
  assert.ok(tarjeta.querySelector('figure'));
  assert.equal(tarjeta.querySelector('p.description').textContent, 'Café negro');
  assert.equal(tarjeta.querySelector('figcaption').textContent, 'Americano');

  const boton = tarjeta.querySelector('button[is="custom-add-button"]');
  assert.equal(boton instanceof window.HTMLButtonElement, true);
  assert.equal(boton.querySelectorAll('span').length, 2);
});

test('el AddButton emite tarjeta-agregar con los datos de la entidad', { skip: !JSDOM && 'jsdom no instalado' }, async () => {
  const window = crearPagina([json(datos)]);
  const tarjeta = window.document.createElement('custom-tarjeta');
  tarjeta.setAttribute('endpoint', `producto/${ID}`);
  window.document.body.appendChild(tarjeta);
  await esperar();

  let detalle = null;
  window.document.addEventListener('tarjeta-agregar', (e) => { detalle = e.detail; });
  tarjeta.querySelector('button').click();
  assert.equal(detalle.datos.nombre, 'Americano');
});

test('si el endpoint falla, la tarjeta muestra el error y deshabilita el botón', { skip: !JSDOM && 'jsdom no instalado' }, async () => {
  const window = crearPagina([new Response(null, { status: 404, headers: { 'Not-Found': 'id inexistente' } })]);
  const tarjeta = window.document.createElement('custom-tarjeta');
  tarjeta.setAttribute('endpoint', `producto/${ID}`);
  window.document.body.appendChild(tarjeta);
  await esperar();

  assert.equal(tarjeta.dataset.estado, 'error');
  assert.equal(tarjeta.querySelector('.description').textContent, 'id inexistente');
  assert.equal(tarjeta.querySelector('button').disabled, true);
});
