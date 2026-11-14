const test = require('node:test');
const assert = require('node:assert/strict');
const { leer } = require('../helpers/cargar');

let JSDOM = null;
try { ({ JSDOM } = require('jsdom')); } catch { /* jsdom no instalado */ }

test('el label se muestra por defecto y solo se oculta con hide-label', { skip: !JSDOM && 'jsdom no instalado' }, () => {
  const dom = new JSDOM('<!DOCTYPE html><body></body>', { runScripts: 'dangerously', url: 'http://localhost/' });
  const { window } = dom;
  window.document.body.innerHTML = leer('boundary/components/text/textPlantilla.html');
  const script = window.document.createElement('script');
  script.textContent = leer('boundary/components/text/textComportamiento.js');
  window.document.head.appendChild(script);

  const campo = window.document.createElement('custom-text');
  window.document.body.appendChild(campo);
  const label = campo.shadowRoot.querySelector('.custom-text__label');
  assert.equal(label.hidden, false);

  campo.setAttribute('label', 'Nombre');
  assert.equal(campo.shadowRoot.querySelector('.custom-text__label-text').textContent, 'Nombre');

  campo.setAttribute('hide-label', '');
  assert.equal(label.hidden, true);

  campo.removeAttribute('hide-label');
  assert.equal(label.hidden, false);
});
