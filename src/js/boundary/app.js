import { store } from '../store.js';
import { renderLogin } from './pages/login.js';
import { layout } from './pages/layout.js';
import { renderMenu } from './pages/menu.js';
import { renderCarrito } from './pages/carrito.js';
import { renderOrdenes } from './pages/ordenes.js';
import { renderPagos } from './pages/pagos.js';
import { Session } from '../control/Session.js';

function mostrarAvisoConexion(app) {
    let dialog = app.querySelector('.login-popup');
    if (!dialog) {
        dialog = document.createElement('dialog');
        dialog.className = 'login-popup';
        dialog.innerHTML = '<h2>Problema de conexión</h2><p></p><button type="button">Aceptar</button>';
        dialog.querySelector('button').addEventListener('click', () => dialog.close());
        app.appendChild(dialog);
    }
    dialog.querySelector('p').textContent = '¡Parece que algo ha ido mal! Revisa tu conexión a internet o ponte en contacto con nosotros para reparar el problema.';
    if (!dialog.open) dialog.showModal();
}

export function iniciarAplicacion() {
    const app = document.querySelector('#app');
    let rutaActual = null;
    let apiDisponible = false;
    let comprobacionInicialCompleta = false;
    const render = () => {
        app.replaceChildren();
        if (!comprobacionInicialCompleta) {
            app.innerHTML = '<p class="app-loading">Comprobando conexión con Cafefe...</p>';
            return;
        }
        if (!apiDisponible) {
            if (store.estado.sesion) {
                Session.limpiar();
                store.estado.sesion = null;
                store.estado.usuario = '';
                store.estado.carrito = [];
            }
            if (window.location.hash !== '#/login') window.location.hash = '#/login';
            app.appendChild(renderLogin({ onLogin }));
            mostrarAvisoConexion(app);
            return;
        }
        const rutaInicial = Session.rutaInicial(store.estado.sesion) ?? 'login';
        const ruta = (window.location.hash.replace(/^#\/?/, '') || rutaInicial).split('/')[0];
        rutaActual = ruta;
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
            apiDisponible = true;
            comprobacionInicialCompleta = true;
            store.estado.sesion = sesion;
            store.estado.usuario = sesion.nombre;
            store.estado.carrito = sesion.carrito ?? [];
            if (!store.estado.ordenes.length && sesion.ordenes?.length) store.estado.ordenes = sesion.ordenes;
            window.location.hash = `#/${Session.rutaInicial(sesion)}`;
        } catch (exception) {
            error.hidden = false;
            error.textContent = exception.message;
            if (!navigator.onLine || exception instanceof TypeError) {
                apiDisponible = false;
                mostrarAvisoConexion(app);
            }
        }
    };
    const salir = () => { store.cerrarSesion(); window.location.hash = '#/login'; };
    window.addEventListener('hashchange', render);
    window.addEventListener('online', () => {
        Session.verificarConexion()
            .then(() => { apiDisponible = true; })
            .catch(() => { apiDisponible = false; })
            .finally(() => { comprobacionInicialCompleta = true; render(); });
    });
    window.addEventListener('offline', () => {
        apiDisponible = false;
        comprobacionInicialCompleta = true;
        render();
    });
    store.suscribir((estado, cambio) => {
        if (cambio === 'carrito' && rutaActual === 'menu') {
            const contador = app.querySelector('.page-header .status-filter');
            if (contador) contador.textContent = `${estado.carrito.length} productos`;
            return;
        }
        render();
    });
    app.innerHTML = '<p class="app-loading">Cargando Cafefe...</p>';
    store.cargarCatalogo().finally(() => {
        if (comprobacionInicialCompleta) render();
    });
    Session.verificarConexion()
        .then(() => { apiDisponible = true; })
        .catch(() => { apiDisponible = false; })
        .finally(() => {
            comprobacionInicialCompleta = true;
            render();
        });
}
