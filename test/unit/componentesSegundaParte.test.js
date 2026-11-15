const test = require('node:test');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');
const fs = require('node:fs');
const path = require('node:path');

const raiz = path.resolve(__dirname, '..', '..');
const leer = (archivo) => fs.readFileSync(path.join(raiz, archivo), 'utf8');
const esperar = () => new Promise((resolver) => setTimeout(resolver, 0));

function pagina(archivos) {
  const dom = new JSDOM('<!doctype html><body></body>', { runScripts: 'dangerously', url: 'http://localhost/' });
  dom.window.fetch = async (url) => {
    const nombre = String(url).split('/').pop();
    const contenido = leer(`boundary/components/${nombre === 'itemCarritoPlantilla.html' ? 'itemCarrito' : 'popup'}/${nombre}`);
    return { ok: true, statusText: 'OK', text: async () => contenido };
  };
  for (const archivo of archivos) dom.window.eval(leer(archivo));
  return dom;
}

test('CambioPagina emite la ruta seleccionada', () => {
  const dom = pagina(['boundary/components/cambioPagina/cambioPaginaComportamiento.js']);
  const paginaComponente = dom.window.document.createElement('cambio-pagina');
  paginaComponente.setAttribute('ruta', 'carrito');
  paginaComponente.setAttribute('titulo', 'Carrito');
  let ruta;
  paginaComponente.addEventListener('cambiar-pagina', (evento) => { ruta = evento.detail.ruta; });
  dom.window.document.body.appendChild(paginaComponente);
  paginaComponente.shadowRoot.querySelector('a').click();
  assert.equal(ruta, 'carrito');
  dom.window.close();
});

test('RejillaTarjetas crea una tarjeta por registro', () => {
  const dom = pagina(['boundary/components/rejillaTarjetas/rejillaTarjetasComportamiento.js']);
  const rejilla = dom.window.document.createElement('rejilla-tarjetas');
  rejilla.setAttribute('registros', JSON.stringify([{ titulo: 'Cafe' }, { titulo: 'Te' }]));
  dom.window.document.body.appendChild(rejilla);
  assert.equal(rejilla.shadowRoot.querySelectorAll('custom-tarjeta').length, 2);
  dom.window.close();
});

test('ItemCarrito usa SpinnerNumerico y emite el evento de eliminar', async () => {
  const dom = pagina([
    'boundary/components/spinnerNumerico/spinnerNumericoComportamiento.js',
    'boundary/components/botonCircular/botonCircularComportamiento.js',
    'boundary/components/itemCarrito/itemCarritoComportamiento.js'
  ]);
  dom.window.document.body.innerHTML = `${leer('boundary/components/spinnerNumerico/spinnerNumericoPlantilla.html')}\n${leer('boundary/components/botonCircular/botonCircularPlantilla.html')}`;
  const item = dom.window.document.createElement('item-carrito');
  item.id = 'cafe-1';
  let eliminado = false;
  item.addEventListener('eliminar-item', () => { eliminado = true; });
  dom.window.document.body.appendChild(item);
  await esperar();
  assert.ok(item.shadowRoot.querySelector('spinner-numerico'));
  item.shadowRoot.querySelector('custom-boton-circular').click();
  assert.equal(eliminado, true);
  dom.window.close();
});

test('PopUp expone aceptar, cancelar y cerrar', async () => {
  const dom = pagina(['boundary/components/popup/popUpComportamiento.js']);
  const popup = dom.window.document.createElement('app-popup');
  dom.window.document.body.appendChild(popup);
  await esperar();

  const motivos = [];
  popup.addEventListener('cerrar-popup', (evento) => motivos.push(evento.detail.motivo));
  popup.shadowRoot.querySelector('.popup__aceptar').click();
  popup.shadowRoot.querySelector('.popup__cancelar').click();
  popup.shadowRoot.querySelector('.popup__cerrar').click();

  assert.deepEqual(motivos, ['aceptar', 'cancelar', 'cerrar']);
  dom.window.close();
});
