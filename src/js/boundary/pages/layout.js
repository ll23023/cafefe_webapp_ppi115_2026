export function layout(contenido, ruta, sesion, onLogout) {
    const shell = document.createElement('div');
    shell.className = 'app-shell';
    const esCliente = sesion?.tipo === 'cliente';
    const esCaja = /caja|cajero/.test(sesion?.rol ?? '');
    const nav = esCliente ? '<a href="#/menu" data-route="menu">Inicio</a>' : esCaja ? '<a href="#/pagos" data-route="pagos">Pagos</a>' : '<a href="#/ordenes" data-route="ordenes">Ordenes</a>';
    shell.innerHTML = `<header class="topbar"><a class="brand" href="#/${esCliente ? 'menu' : esCaja ? 'pagos' : 'ordenes'}">cafefe</a><nav class="nav" aria-label="Navegacion principal">${nav}${esCliente ? '<a href="#/carrito" data-route="carrito">Carrito</a>' : ''}</nav><button class="avatar" type="button" aria-label="Abrir menu de usuario">${(sesion?.nombre || 'U').slice(0, 2).toUpperCase()}</button><custom-menu-flotante usuario="${sesion?.nombre ?? ''}" hidden></custom-menu-flotante></header><main class="page">${contenido}</main>`;
    shell.querySelector(`[data-route="${ruta}"]`)?.setAttribute('aria-current', 'page');
    const avatar = shell.querySelector('.avatar');
    const menu = shell.querySelector('custom-menu-flotante');
    avatar.addEventListener('click', () => menu.toggleAttribute('hidden'));
    menu.addEventListener('salir', onLogout);
    return shell;
}

export function boton(texto, tipo = 'primary') { return `<custom-boton-redondeado texto="${texto}" tipo="${tipo}"></custom-boton-redondeado>`; }
