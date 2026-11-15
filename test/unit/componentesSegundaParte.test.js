const test = require('node:test');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');
const fs = require('node:fs');
const path = require('node:path');

const raiz = path.resolve(__dirname, '..', '..');
const leer = (archivo) => fs.readFileSync(path.join(raiz, archivo), 'utf8');
const esperar = () => new Promise((resolver) => setTimeout(resolver, 0));
const plantillas = new Map([
  ['/boundary/components/itemCarrito/itemCarritoPlantilla.html', leer('boundary/components/itemCarrito/itemCarritoPlantilla.html')],
  ['/boundary/components/popup/popUpPlantilla.html', leer('boundary/components/popup/popUpPlantilla.html')],
  ['/boundary/components/spinnerNumerico/spinnerNumericoPlantilla.html', leer('boundary/components/spinnerNumerico/spinnerNumericoPlantilla.html')],
  ['/boundary/components/botonCircular/botonCircularPlantilla.html', leer('boundary/components/botonCircular/botonCircularPlantilla.html')],
  ['/boundary/components/botonRedondeado/botonRedondeadoPlantilla.html', leer('boundary/components/botonRedondeado/botonRedondeadoPlantilla.html')],
  ['/boundary/components/botonFlotante/botonFlotantePlantilla.html', leer('boundary/components/botonFlotante/botonFlotantePlantilla.html')]
]);

function pagina(archivos) {
  const dom = new JSDOM('<!doctype html><body></body>', { runScripts: 'dangerously', url: 'http://localhost/' });
  dom.window.fetch = async (url) => {
    const ruta = new URL(url, dom.window.location.href).pathname;
    const contenido = plantillas.get(ruta);
    return {
      ok: Boolean(contenido),
      statusText: contenido ? 'OK' : 'Not Found',
      text: async () => contenido ?? ''
    };
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

test('BotonRedondeado y BotonFlotante renderizan al conectarse', async () => {
  const dom = pagina([
    'boundary/components/botonRedondeado/botonRedondeadoComportamiento.js',
    'boundary/components/botonFlotante/botonFlotanteComportamiento.js'
  ]);
  const botonRedondeado = dom.window.document.createElement('custom-boton-redondeado');
  botonRedondeado.setAttribute('texto', 'Completar orden');
  const botonFlotante = dom.window.document.createElement('custom-boton-flotante');
  botonFlotante.setAttribute('texto', 'Ver carrito');

  dom.window.document.body.append(botonRedondeado, botonFlotante);
  await esperar();

  assert.equal(botonRedondeado.shadowRoot.querySelector('button').textContent.trim(), 'Completar orden');
  assert.equal(botonFlotante.shadowRoot.querySelector('button').textContent.trim(), 'Ver carrito');
  dom.window.close();
});
