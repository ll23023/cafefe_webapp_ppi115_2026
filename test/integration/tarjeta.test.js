const test = require('node:test');
const assert = require('node:assert/strict');
const { leer } = require('../helpers/cargar');

let JSDOM = null;
try { ({ JSDOM } = require('jsdom')); } catch { /* jsdom no instalado */ }

const COMPONENTES = new Map([
  ['/boundary/components/botonCircular/botonCircularPlantilla.html',
    leer('boundary/components/botonCircular/botonCircularPlantilla.html')],
  ['/boundary/components/tarjeta/tarjetaPlantilla.html',
    leer('boundary/components/tarjeta/tarjetaPlantilla.html')]
]);

const esperarRender = () => new Promise((resolver) => setTimeout(resolver, 0));

function crearPagina() {
  const dom = new JSDOM('<!DOCTYPE html><body></body>', {
    runScripts: 'dangerously',
    url: 'http://localhost/'
  });
  const { window } = dom;
  window.fetch = async (url) => {
    const ruta = new URL(url, window.location.href).pathname;
    const contenido = COMPONENTES.get(ruta);
    return {
      ok: Boolean(contenido),
      statusText: contenido ? 'OK' : 'Not Found',
      text: async () => contenido ?? ''
    };
  };
  for (const archivo of [
    'boundary/components/botonCircular/botonCircularComportamiento.js',
    'boundary/components/tarjeta/tarjetaComportamiento.js'
  ]) {
    window.eval(leer(archivo));
  }
  return window;
}

test('tarjeta renderiza atributos e imagen predeterminada desde su plantilla real', { skip: !JSDOM && 'jsdom no instalado' }, async () => {
  const window = crearPagina();
  const tarjeta = window.document.createElement('custom-tarjeta');
  tarjeta.setAttribute('titulo', 'Capuchino');
  tarjeta.setAttribute('descripcion', 'Café con leche espumada');
  tarjeta.setAttribute('precio', '$3.50');
  window.document.body.appendChild(tarjeta);
  await esperarRender();

  const raiz = tarjeta.shadowRoot;
  assert.equal(raiz.querySelector('.tarjeta__titulo').textContent, 'Capuchino');
  assert.equal(raiz.querySelector('.tarjeta__descripcion').textContent, 'Café con leche espumada');
  assert.equal(raiz.querySelector('.tarjeta__precio').textContent, '$3.50');
  assert.equal(raiz.querySelector('.tarjeta__imagen').getAttribute('src'), '/assets/icons/capuchino.png');
  assert.equal(raiz.querySelector('custom-boton-circular').shadowRoot.querySelectorAll('.boton-circular__barra').length, 2);
  window.close();
});

test('el botón de la tarjeta emite tarjeta-agregar con título y precio', { skip: !JSDOM && 'jsdom no instalado' }, async () => {
  const window = crearPagina();
  const tarjeta = window.document.createElement('custom-tarjeta');
  tarjeta.setAttribute('titulo', 'Americano');
  tarjeta.setAttribute('precio', '$2.00');
  window.document.body.appendChild(tarjeta);
  await esperarRender();
  await esperarRender();

  let detalle = null;
  tarjeta.addEventListener('tarjeta-agregar', (evento) => { detalle = evento.detail; });
  tarjeta.shadowRoot.querySelector('custom-boton-circular').click();
  assert.equal(detalle.titulo, 'Americano');
  assert.equal(detalle.precio, '$2.00');
  window.close();
});

test('el botón circular acepta texto, imagen y color como atributos', { skip: !JSDOM && 'jsdom no instalado' }, async () => {
  const window = crearPagina();
  const boton = window.document.createElement('custom-boton-circular');
  boton.setAttribute('texto', '×');
  boton.setAttribute('color', 'rgb(10, 20, 30)');
  window.document.body.appendChild(boton);
  await esperarRender();

  const raiz = boton.shadowRoot;
  assert.ok(raiz.querySelector('slot[name="contenido"]'));
  assert.equal(raiz.querySelector('.boton-circular__texto').textContent, '×');
  assert.equal(raiz.querySelector('.boton-circular__texto').hidden, false);
  assert.equal(raiz.querySelectorAll('.boton-circular__barra[hidden]').length, 2);
  assert.equal(raiz.querySelector('.boton-circular').style.getPropertyValue('--boton-circular-color'), 'rgb(10, 20, 30)');

  boton.setAttribute('icono', '/assets/icons/CarritoCompra.png');
  await esperarRender();
  assert.equal(raiz.querySelector('.boton-circular__icono').getAttribute('src'), '/assets/icons/CarritoCompra.png');
  assert.equal(raiz.querySelector('.boton-circular__icono').hidden, false);
  assert.equal(raiz.querySelector('.boton-circular__texto').hidden, true);

  boton.removeAttribute('icono');
  boton.removeAttribute('texto');
  await esperarRender();
  assert.equal(raiz.querySelectorAll('.boton-circular__barra[hidden]').length, 0);

  const contenido = window.document.createElement('span');
  contenido.slot = 'contenido';
  boton.appendChild(contenido);
  assert.equal(raiz.querySelector('slot[name="contenido"]').assignedNodes()[0], contenido);
  window.close();
});
