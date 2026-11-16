import { store } from '../store.js';
import { renderLogin } from './pages/login.js';
import { layout } from './pages/layout.js';
import { renderMenu } from './pages/menu.js';
import { renderCarrito } from './pages/carrito.js';
import { renderOrdenes } from './pages/ordenes.js';
import { renderPagos } from './pages/pagos.js';
import { Session } from '../control/Session.js';

export function iniciarAplicacion() {
    const app = document.querySelector('#app');
    let rutaActual = null;
    const render = () => {
        const rutaInicial = Session.rutaInicial(store.estado.sesion) ?? 'login';
        const ruta = (window.location.hash.replace(/^#\/?/, '') || rutaInicial).split('/')[0];
        rutaActual = ruta;
        app.replaceChildren();
        if (!store.estado.sesion && ruta !== 'login') { window.location.hash = '#/login'; return; }
        if (!store.estado.sesion && ruta === 'login') { app.appendChild(renderLogin({ onLogin })); return; }
        if (!Session.puedeVerRuta(store.estado.sesion, ruta)) {
            const destino = Session.rutaInicial(store.estado.sesion);
            if (!destino) {
                store.cerrarSesion();
                window.location.hash = '#/login';
                return;
            }
            window.location.hash = `#/${destino}`;
            return;
        }
        let contenido;
        if (ruta === 'carrito') contenido = renderCarrito(store, navegar);
        else if (ruta === 'ordenes') contenido = renderOrdenes(store);
        else if (ruta === 'pagos') contenido = renderPagos(store);
        else contenido = renderMenu(store, navegar);
        app.appendChild(layout('', ruta, store.estado.sesion, salir, store));
        app.querySelector('.page').replaceChildren(contenido);
    };
    const navegar = (ruta) => { window.location.hash = `#/${ruta}`; };
    const onLogin = async (usuario, contrasena, error) => {
        try {
            const sesion = await Session.iniciar(usuario, contrasena);
            store.estado.sesion = sesion;
            store.estado.usuario = sesion.nombre;
            store.estado.carrito = sesion.carrito ?? [];
            if (!store.estado.ordenes.length && sesion.ordenes?.length) store.estado.ordenes = sesion.ordenes;
            window.location.hash = `#/${Session.rutaInicial(sesion)}`;
        } catch (exception) {
            error.hidden = false;
            error.textContent = exception.message;
        }
    };
    const salir = () => { store.cerrarSesion(); window.location.hash = '#/login'; };
    window.addEventListener('hashchange', render);
    window.addEventListener('online', render);
    window.addEventListener('offline', render);
    store.suscribir((estado, cambio) => {
        if (cambio === 'carrito' && rutaActual === 'menu') {
            const contador = app.querySelector('.page-header .status-filter');
            if (contador) contador.textContent = `${estado.carrito.length} productos`;
            return;
        }
        render();
    });
    app.innerHTML = '<p class="app-loading">Cargando Cafefe...</p>';
    store.cargarCatalogo().finally(render);
}
