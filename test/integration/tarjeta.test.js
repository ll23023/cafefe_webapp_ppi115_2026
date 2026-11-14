// Prueba de integración de la tarjeta y su botón circular en un DOM simulado.
// Requiere jsdom; si no está instalado, la prueba se omite.
const test = require('node:test');
const assert = require('node:assert/strict');
const { leer, fetchSimulado, json, ID } = require('../helpers/cargar');

let JSDOM = null;
try { ({ JSDOM } = require('jsdom')); } catch { /* jsdom no instalado */ }

const SCRIPTS = ['entity/Uuid.js', 'entity/Entidades.js', 'entity/producto.js', 'control/DefaultDAO.js',
  'boundary/Model.js', 'boundary/components/botonCircular/botonCircularComportamiento.js', 'boundary/components/tarjeta/tarjeta.js'];

const PLANTILLAS = ['boundary/components/botonCircular/botonCircularPlantilla.html', 'boundary/components/tarjeta/tarjeta.html'];

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

  const boton = tarjeta.querySelector('custom-boton-circular');
  assert.equal(boton instanceof window.HTMLElement, true);
  assert.equal(boton.shadowRoot.querySelectorAll('.boton-circular__barra').length, 2);
});

test('el botón circular emite tarjeta-agregar con los datos de la entidad', { skip: !JSDOM && 'jsdom no instalado' }, async () => {
  const window = crearPagina([json(datos)]);
  const tarjeta = window.document.createElement('custom-tarjeta');
  tarjeta.setAttribute('endpoint', `producto/${ID}`);
  window.document.body.appendChild(tarjeta);
  await esperar();

  let detalle = null;
  window.document.addEventListener('tarjeta-agregar', (e) => { detalle = e.detail; });
  tarjeta.querySelector('custom-boton-circular').click();
  assert.equal(detalle.datos.nombre, 'Americano');
});

test('el botón circular renderiza texto, imagen y color desde sus atributos', { skip: !JSDOM && 'jsdom no instalado' }, () => {
  const window = crearPagina([]);
  const boton = window.document.createElement('custom-boton-circular');
  boton.setAttribute('texto', '×');
  boton.setAttribute('color', 'rgb(10, 20, 30)');
  window.document.body.appendChild(boton);

  const raiz = boton.shadowRoot;
  assert.ok(raiz.querySelector('slot[name="contenido"]'));
  assert.equal(raiz.querySelector('.boton-circular__texto').textContent, '×');
  assert.equal(raiz.querySelector('.boton-circular__texto').hidden, false);
  assert.equal(raiz.querySelectorAll('.boton-circular__barra[hidden]').length, 2);
  assert.equal(raiz.querySelector('.boton-circular').style.getPropertyValue('--boton-circular-color'), 'rgb(10, 20, 30)');

  boton.setAttribute('icono', '/assets/icons/CarritoCompra.png');
  assert.equal(raiz.querySelector('.boton-circular__icono').getAttribute('src'), '/assets/icons/CarritoCompra.png');
  assert.equal(raiz.querySelector('.boton-circular__icono').hidden, false);
  assert.equal(raiz.querySelector('.boton-circular__texto').hidden, true);

  boton.removeAttribute('icono');
  boton.removeAttribute('texto');
  assert.equal(raiz.querySelectorAll('.boton-circular__barra[hidden]').length, 0);

  const contenido = window.document.createElement('span');
  contenido.slot = 'contenido';
  boton.appendChild(contenido);
  assert.equal(raiz.querySelector('slot[name="contenido"]').assignedNodes()[0], contenido);
});

test('si el endpoint falla, la tarjeta muestra el error y deshabilita el botón', { skip: !JSDOM && 'jsdom no instalado' }, async () => {
  const window = crearPagina([new Response(null, { status: 404, headers: { 'Not-Found': 'id inexistente' } })]);
  const tarjeta = window.document.createElement('custom-tarjeta');
  tarjeta.setAttribute('endpoint', `producto/${ID}`);
  window.document.body.appendChild(tarjeta);
  await esperar();

  assert.equal(tarjeta.dataset.estado, 'error');
  assert.equal(tarjeta.querySelector('.description').textContent, 'id inexistente');
  assert.equal(tarjeta.querySelector('custom-boton-circular').disabled, true);
});
