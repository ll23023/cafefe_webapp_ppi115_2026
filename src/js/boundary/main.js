import { FiltroCircular } from "./components/filtroCircular/filtroCircularComportamiento.js";
import "./components/carruselFiltros/carruselFiltrosComportamiento.js";
import "./components/item/itemComportamiento.js";
import "./components/listaItems/listaItemsComportamiento.js";
import "./components/cambioEstado/cambioEstadoComportamiento.js";
import "./components/botonRedondeado/botonRedondeadoComportamiento.js";
import "./components/barraInferior/barraInferiorComportamiento.js";
import "./components/botonFlotante/botonFlotanteComportamiento.js";
import "./components/checkbox/checkboxComportamiento.js";
import "./components/spinnerNumerico/spinnerNumericoComportamiento.js";
import "./components/botonCircular/botonCircularComportamiento.js";
import "./components/tarjeta/tarjetaComportamiento.js";
import "./components/menuFlotante/menuFlotanteComportamiento.js";
import "./components/notificacion/notificacionComportamiento.js";
import "./components/text/textComportamiento.js";
import "./components/itemCarrito/itemCarritoComportamiento.js";
import "./components/panel/panelComportamiento.js";
import "./components/contenidoDinamico/contenidoDinamicoComportamiento.js";
import "./components/popup/popUpComportamiento.js";
import "./components/rejillaTarjetas/rejillaTarjetasComportamiento.js";
import "./components/cambioPagina/cambioPaginaComportamiento.js";
import "./components/router/routerComportamiento.js";
import { iniciarAplicacion } from "./app.js";

async function registrarServiceWorker() {
    if (!('serviceWorker' in navigator)) return null;

    const script = new URL('../../../sw.js', import.meta.url);
    const scope = new URL('../../../', import.meta.url);
    const registration = await navigator.serviceWorker.register(script, { scope: scope.pathname });
    await navigator.serviceWorker.ready;

    const recursos = performance.getEntriesByType('resource')
        .map((entrada) => new URL(entrada.name, import.meta.url))
        .filter((url) => url.origin === location.origin && url.pathname.startsWith(scope.pathname))
        .map((url) => url.href);
    (navigator.serviceWorker.controller || registration.active)
        ?.postMessage({ type: 'PRECACHE_RESOURCES', urls: recursos });
    return registration;
}

registrarServiceWorker().then(
    iniciarAplicacion,
    (error) => {
        console.error('No se pudo registrar el Service Worker; la aplicación seguirá en línea:', error);
        iniciarAplicacion();
    }
);

