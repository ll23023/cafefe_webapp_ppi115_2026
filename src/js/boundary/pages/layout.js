import { mostrarNotificacion } from '../helpers/notificaciones.js';

function aplicacionInstalada() {
    return window.cafefePwaInstalled === true ||
        window.matchMedia?.('(display-mode: standalone)').matches === true ||
        navigator.standalone === true;
}

function actualizarBotonesInstalacion() {
    const ocultar = aplicacionInstalada();
    document.querySelectorAll('.install-app').forEach((contenedor) => {
        contenedor.hidden = ocultar;
    });
}

function diagnosticarInstalacion() {
    if (aplicacionInstalada()) {
        const mensaje = 'La aplicación ya está instalada o se está ejecutando en modo independiente.';
        console.info(mensaje);
        mostrarNotificacion(mensaje, 'exito');
        return;
    }

    const causas = [];
    if (!window.isSecureContext) {
        causas.push('El contexto no es seguro; usa localhost o HTTPS.');
    }
    if (!('serviceWorker' in navigator)) {
        causas.push('Este navegador no soporta Service Workers.');
    } else if (!navigator.serviceWorker.controller) {
        causas.push('El Service Worker aún no controla esta página; verifica su registro y vuelve a cargar.');
    }

    if (causas.length === 0) {
        causas.push('El navegador no ha emitido beforeinstallprompt; puede no soportar la instalación o faltar algún criterio de Chromium.');
    }

    const mensaje = causas.join(' ');
    console.warn('No está disponible la instalación de la PWA:', mensaje);
    mostrarNotificacion(mensaje, 'fracaso');
}

async function solicitarInstalacion() {
    if (aplicacionInstalada() || !window.deferredInstallPrompt) {
        diagnosticarInstalacion();
        actualizarBotonesInstalacion();
        return;
    }

    const evento = window.deferredInstallPrompt;
    try {
        await evento.prompt();
        await evento.userChoice;
    } catch (error) {
        console.error('No se pudo iniciar la instalación de la aplicación:', error);
    } finally {
        if (window.deferredInstallPrompt === evento) {
            window.deferredInstallPrompt = null;
        }
        actualizarBotonesInstalacion();
    }
}

export function layout(contenido, ruta, sesion, onLogout, store) {
    const shell = document.createElement('div');
    shell.className = 'app-shell';
    const esCliente = sesion?.tipo === 'cliente';
    const esCaja = /caja|cajero/.test(sesion?.rol ?? '');
    const nav = esCliente ? '<a href="#/menu" data-route="menu">Inicio</a>' : esCaja ? '<a href="#/pagos" data-route="pagos">Pagos</a>' : '<a href="#/ordenes" data-route="ordenes">Ordenes</a>';
    shell.innerHTML = `<header class="topbar"><a class="brand" href="#/${esCliente ? 'menu' : esCaja ? 'pagos' : 'ordenes'}"><img src="./assets/images/cafefeLogo.png" alt=""><span>cafefe</span></a><nav class="nav" aria-label="Navegacion principal">${nav}${esCliente ? '<a href="#/carrito" data-route="carrito">Carrito</a>' : ''}</nav><div class="install-app" hidden><custom-boton-redondeado class="install-app__button" texto="Instalar aplicación"></custom-boton-redondeado></div><button class="avatar" type="button" aria-label="Abrir menu de usuario">${(sesion?.nombre || 'U').slice(0, 2).toUpperCase()}</button><custom-menu-flotante usuario="${sesion?.nombre ?? ''}" hidden></custom-menu-flotante></header><p class="connection-banner" role="status" hidden></p><main class="page">${contenido}</main><div class="toast" aria-live="polite"></div>`;
    const connectionBanner = shell.querySelector('.connection-banner');
    const queuedOrders = store?.ordenesOfflinePendientes?.length ?? 0;
    if (store?.errorColaOffline) {
        connectionBanner.hidden = false;
        connectionBanner.setAttribute('role', 'alert');
        connectionBanner.textContent = 'No se pudo leer la cola de órdenes guardadas en este dispositivo.';
    } else if (!navigator.onLine) {
        connectionBanner.hidden = false;
        connectionBanner.textContent = queuedOrders
            ? `Sin conexión. Hay ${queuedOrders} orden(es) guardadas localmente y pendientes de sincronización.`
            : 'Sin conexión a internet. Los pagos requieren conexión.';
    } else if (queuedOrders) {
        connectionBanner.hidden = false;
        connectionBanner.textContent = `Hay ${queuedOrders} orden(es) pendientes. Se requiere una actualización de la API para sincronizarlas de forma segura; no se pueden pagar todavía.`;
    }
    const instalador = shell.querySelector('.install-app');
    instalador.hidden = aplicacionInstalada();
    instalador.addEventListener('click', solicitarInstalacion);
    shell.querySelector(`[data-route="${ruta}"]`)?.setAttribute('aria-current', 'page');
    const avatar = shell.querySelector('.avatar');
    const menu = shell.querySelector('custom-menu-flotante');
    avatar.addEventListener('click', () => menu.toggleAttribute('hidden'));
    menu.addEventListener('salir', onLogout);
    actualizarBotonesInstalacion();
    return shell;
}

export function boton(texto, tipo = 'primary') { return `<custom-boton-redondeado texto="${texto}" tipo="${tipo}"></custom-boton-redondeado>`; }
