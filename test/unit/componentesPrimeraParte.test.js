const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const RAIZ = path.resolve(__dirname, '..', '..');
const leer = (archivo) => fs.readFileSync(path.join(RAIZ, archivo), 'utf8');
const esperarRender = () => new Promise((resolver) => setTimeout(resolver, 0));

const PLANTILLAS = {
  'carruselFiltrosPlantilla.html': leer('boundary/components/carruselFiltros/carruselFiltrosPlantilla.html'),
  'itemPlantilla.html': leer('boundary/components/item/itemPlantilla.html'),
  'listaItemsPlantilla.html': leer('boundary/components/listaItems/listaItemsPlantilla.html'),
  'cambioEstadoPlantilla.html': leer('boundary/components/cambioEstado/cambioEstadoPlantilla.html')
};

function crearPagina(archivos) {
  const dom = new JSDOM('<!DOCTYPE html><body></body>', {
    runScripts: 'dangerously',
    url: 'http://localhost/'
  });
  dom.window.fetch = async (url) => {
    const nombre = String(url).split('/').pop();
    const contenido = PLANTILLAS[nombre];
    if (!contenido) return { ok: false, statusText: 'Not Found', text: async () => '' };
    return { ok: true, statusText: 'OK', text: async () => contenido };
  };
  for (const archivo of archivos) dom.window.eval(leer(archivo));
  return dom;
}

test('Item renderiza sus atributos en la plantilla', async () => {
  const dom = crearPagina(['boundary/components/item/itemComportamiento.js']);
  const item = dom.window.document.createElement('lista-item');
  item.setAttribute('titulo', 'Americano');
  item.setAttribute('descripcion', 'Cafe negro');
  item.setAttribute('precio', '2.00');
  dom.window.document.body.appendChild(item);
  await esperarRender();

  assert.equal(item.shadowRoot.querySelector('.item__titulo').textContent, 'Americano');
  assert.equal(item.shadowRoot.querySelector('.item__descripcion').textContent, 'Cafe negro');
  assert.equal(item.shadowRoot.querySelector('.item__precio').textContent, '2.00');
  dom.window.close();
});

test('ListaItems consume un JSON y crea un item por registro', async () => {
  const dom = crearPagina([
    'boundary/components/item/itemComportamiento.js',
    'boundary/components/listaItems/listaItemsComportamiento.js'
  ]);
  const lista = dom.window.document.createElement('lista-items');
  lista.setAttribute('items', JSON.stringify([
    { titulo: 'Cafe', descripcion: 'Caliente' },
    { titulo: 'Te', descripcion: 'Verde' }
  ]));
  dom.window.document.body.appendChild(lista);
  await esperarRender();

  assert.equal(lista.shadowRoot.querySelectorAll('lista-item').length, 2);
  dom.window.close();
});

test('CarruselFiltros consume un JSON y actualiza sus botones por overflow', async () => {
  const dom = crearPagina([
    'boundary/components/carruselFiltros/carruselFiltrosComportamiento.js'
  ]);
  const carrusel = dom.window.document.createElement('carrusel-filtros');
  carrusel.setAttribute('filtros', JSON.stringify([{ id: 'cafe' }, { id: 'te' }]));
  dom.window.document.body.appendChild(carrusel);
  await esperarRender();

  const lista = carrusel.shadowRoot.querySelector('.carrusel-filtros__lista');
  Object.defineProperties(lista, {
    clientWidth: { configurable: true, value: 100 },
    scrollWidth: { configurable: true, value: 250 },
    scrollLeft: { configurable: true, writable: true, value: 0 }
  });
  carrusel._actualizarBotones();

  assert.equal(lista.querySelectorAll('filtro-circular').length, 2);
  assert.equal(carrusel.shadowRoot.querySelector('.carrusel-filtros__boton--anterior').disabled, true);
  assert.equal(carrusel.shadowRoot.querySelector('.carrusel-filtros__boton--siguiente').disabled, false);
  dom.window.close();
});

test('CambioEstado permite revertir en modo toggle y bloquea en oneChange', async () => {
  const dom = crearPagina(['boundary/components/cambioEstado/cambioEstadoComportamiento.js']);
  const toggle = dom.window.document.createElement('cambio-estado');
  dom.window.document.body.appendChild(toggle);
  await esperarRender();
  const checkboxToggle = toggle.shadowRoot.querySelector('.cambio-estado__checkbox');

  checkboxToggle.click();
  assert.equal(toggle.getAttribute('estado'), 'listo');
  checkboxToggle.click();
  assert.equal(toggle.getAttribute('estado'), 'pendiente');

  const oneChange = dom.window.document.createElement('cambio-estado');
  oneChange.setAttribute('modo', 'oneChange');
  dom.window.document.body.appendChild(oneChange);
  await esperarRender();
  const checkboxOneChange = oneChange.shadowRoot.querySelector('.cambio-estado__checkbox');
  checkboxOneChange.click();

  assert.equal(oneChange.getAttribute('estado'), 'listo');
  assert.equal(checkboxOneChange.disabled, true);
  dom.window.close();
});
