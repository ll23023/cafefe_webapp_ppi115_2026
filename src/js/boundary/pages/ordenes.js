import { mostrarNotificacion } from '../helpers/notificaciones.js';

export function renderOrdenes(store) {
    const view = document.createElement('section');
    view.innerHTML = `<div class="page-header"><h1>Ordenes de cocina</h1><custom-boton-redondeado class="mark-all-ready" texto="Marcar todas listas"></custom-boton-redondeado></div><div class="order-list"></div>`;
    const list = view.querySelector('.order-list');
    const renderLista = () => {
        list.replaceChildren();
        store.ordenesPendientesDespacho.forEach((orden) => {
            const row = document.createElement('button');
            row.className = 'order-row';
            row.type = 'button';
            row.innerHTML = `<span><strong>Orden ${orden.id}</strong><span>${orden.cliente}</span></span><cambio-estado estado="${orden.estado}"></cambio-estado>`;
            row.addEventListener('click', (event) => {
                if (!event.target.closest('cambio-estado')) abrirOrden(view, store, orden);
            });
            row.querySelector('cambio-estado').addEventListener('cambio-estado', (event) => {
                event.stopPropagation();
                if (event.detail.estado !== 'listo') return;
                if (!todosLosProductosListos(orden)) {
                    mostrarNotificacion('Marca todos los productos como Listo antes de completar la orden.', 'fracaso');
                    renderLista();
                    return;
                }
                if (store.cambiarOrden(orden.id, { estado: 'listo' })) {
                    mostrarNotificacion(`La orden ${orden.id} está lista para pago.`);
                }
            });
            list.appendChild(row);
        });
    };

    view.querySelector('.mark-all-ready').addEventListener('click', () => {
        const pendientes = [...store.ordenesPendientesDespacho];
        if (!pendientes.length) return;
        const ordenesConProductos = pendientes.filter((orden) => Array.isArray(orden.items) && orden.items.length > 0);
        ordenesConProductos.forEach((orden) => {
            orden.items = orden.items.map((item) => ({ ...item, estado: 'listo' }));
            orden.estado = 'listo';
        });
        store.persistir();
        renderLista();
        const omitidas = pendientes.length - ordenesConProductos.length;
        const texto = `Se marcaron ${ordenesConProductos.length} órdenes como listas.` +
            (omitidas ? ` Se omitieron ${omitidas} órdenes sin productos.` : '');
        mostrarNotificacion(texto, ordenesConProductos.length ? 'exito' : 'fracaso');
    });

    renderLista();
    return view;
}

function todosLosProductosListos(orden) {
    return Array.isArray(orden.items) &&
        orden.items.length > 0 &&
        orden.items.every((item) => String(item.estado ?? '').toLowerCase() === 'listo');
}

function abrirOrden(view, store, orden) {
    const popup = document.createElement('app-popup');
    popup.setAttribute('variante', 'vacio');
    popup.setAttribute('titulo', `Orden ${orden.id}`);
    popup.setAttribute('descripcion', orden.cliente);
    popup.setAttribute('alineacion', 'derecha');
    popup.innerHTML = `<div class="modal-items">${(orden.items ?? []).map((item, indice) => `<div class="modal-item"><span>${item.cantidad} x ${item.titulo}</span><cambio-estado data-item="${indice}" estado="${item.estado || 'pendiente'}"></cambio-estado></div>`).join('')}</div><custom-boton-redondeado class="mark-ready" texto="Marcar todo listo"></custom-boton-redondeado><custom-barra-inferior texto="${orden.total}" texto-primario="Despachar orden"></custom-barra-inferior>`;
    popup.addEventListener('cerrar-popup', () => popup.remove());
    view.appendChild(popup);
    popup.show();

    popup.querySelector('.mark-ready').addEventListener('click', () => {
        orden.items = (orden.items ?? []).map((item) => ({ ...item, estado: 'listo' }));
        popup.querySelectorAll('cambio-estado').forEach((item) => item.setAttribute('estado', 'listo'));
        store.persistir();
    });
    popup.querySelectorAll('cambio-estado').forEach((control) => control.addEventListener('cambio-estado', (event) => {
        orden.items[Number(control.dataset.item)].estado = event.detail.estado;
        store.persistir();
    }));
    popup.querySelector('custom-barra-inferior').addEventListener('barra-accion', (event) => {
        if (event.detail.accion === 'primario') confirmarDespacho(view, popup, store, orden);
    });
}

function confirmarDespacho(view, anterior, store, orden) {
    if (!todosLosProductosListos(orden)) {
        mostrarNotificacion('Marca todos los productos como Listo antes de despachar la orden.', 'fracaso');
        return;
    }

    const popup = document.createElement('app-popup');
    popup.setAttribute('titulo', 'Quieres despachar la orden?');
    popup.setAttribute('descripcion', 'Asegurate de revisar que todos los productos esten listos antes de despachar la orden.');
    popup.setAttribute('texto-cancelar', 'No, dejame revisar');
    popup.setAttribute('texto-aceptar', 'Si, despachar');
    popup.setAttribute('alineacion', 'derecha');
    view.appendChild(popup);
    popup.show();
    popup.addEventListener('aceptar-popup', () => {
        if (!todosLosProductosListos(orden)) {
            popup.setAttribute('descripcion', 'Marca todos los productos como Listo antes de despachar la orden.');
            return;
        }
        if (store.cambiarOrden(orden.id, { estado: 'listo' })) {
            mostrarNotificacion(`La orden ${orden.id} está lista para pago.`);
            popup.remove();
            anterior.remove();
        }
    });
    popup.addEventListener('cerrar-popup', () => {
        if (popup.isConnected) popup.remove();
    });
}
