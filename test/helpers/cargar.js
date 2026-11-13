// Ejecuta los archivos del frontend como scripts clásicos dentro de un mismo contexto,
// igual que lo hace el navegador con varias etiquetas <script>. Así el código fuente
// no necesita exports ni imports solo para poder probarse.
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

const RAIZ = path.resolve(__dirname, '..', '..');

function leer(archivo) {
  return fs.readFileSync(path.join(RAIZ, archivo), 'utf8');
}

function cargar(archivos, globales = {}) {
  const contexto = vm.createContext({
    console, URL, Response, Headers, EventTarget, Event, CustomEvent, crypto, ...globales
  });
  for (const archivo of archivos) {
    new vm.Script(leer(archivo), { filename: archivo }).runInContext(contexto);
  }
  return (nombre) => vm.runInContext(nombre, contexto);
}

// fetch simulado: entrega las respuestas en orden y registra las llamadas recibidas.
function fetchSimulado(respuestas) {
  const fn = async (url, opciones) => {
    fn.llamadas.push({ url, opciones });
    const siguiente = respuestas.shift();
    if (siguiente instanceof Error) throw siguiente;
    return siguiente;
  };
  fn.llamadas = [];
  return fn;
}

const json = (cuerpo, estado = 200, encabezados = {}) =>
  new Response(JSON.stringify(cuerpo), { status: estado, headers: { 'Content-Type': 'application/json', ...encabezados } });

const ID = 'c0000000-0000-4000-8000-000000000001';

module.exports = { cargar, leer, fetchSimulado, json, ID, RAIZ };
