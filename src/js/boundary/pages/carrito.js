import { formatearTotal } from '../../store.js';
import { mostrarNotificacion } from '../helpers/notificaciones.js';

export function renderCarrito(store, navigate) {
    const view = document.createElement('section');
    const render = () => {
        view.innerHTML = `<div class="page-header"><h1>Orden 4hu34-34hi-34hu34-67sdf</h1></div><lista-items class="cart-list" tipo="carrito" items='${JSON.stringify(store.estado.carrito).replaceAll("'", "&apos;")}'></lista-items><div class="cart-actions"><span>$${formatearTotal(store.estado.carrito)}</span><custom-boton-redondeado class="continue-shopping" texto="Seguir comprando" tipo="secondary"></custom-boton-redondeado><custom-boton-redondeado class="complete-order" texto="Completar orden"></custom-boton-redondeado></div>`;
        view.querySelector('.continue-shopping').addEventListener('click', () => navigate('menu'));
        view.querySelector('.complete-order').toggleAttribute('disabled', store.estado.carrito.length === 0);
        view.querySelector('.complete-order').addEventListener('click', () => {
            if (store.estado.carrito.length) confirmarOrden(view, store, navigate);
        });
    };
    view.addEventListener('eliminar-item', (event) => { store.eliminar(event.detail.id); render(); });
    view.addEventListener('change', (event) => { if (event.target.tagName === 'ITEM-CARRITO') store.actualizarCantidad(event.target.id, event.target.getAttribute('cantidad')); });
    render();
    return view;
}

function confirmarOrden(view, store, navigate) {
    const popup = document.createElement('app-popup');
    popup.setAttribute('titulo', 'Quieres completar la orden?');
    popup.setAttribute('descripcion', 'La orden se enviara a cocina para su preparacion.');
    popup.setAttribute('texto-cancelar', 'No, dejame revisar');
    popup.setAttribute('texto-aceptar', 'Si, completar');
    view.appendChild(popup);
    popup.show();
    popup.addEventListener('aceptar-popup', () => {
        let orden;
        try {
            orden = store.crearOrdenDesdeCarrito(store.estado.usuario);
        } catch (error) {
            mostrarNotificacion(`No se pudo guardar la orden: ${error.message}`, 'fracaso');
            return;
        }
        popup.remove();
        if (orden?.estadoSincronizacion === 'pendiente') {
            window.addEventListener('hashchange', function() {
                mostrarNotificacion('La orden se guardó localmente y queda pendiente de sincronización.', 'exito');
            }, { once: true });
        }
        navigate('menu');
    });
    popup.addEventListener('cerrar-popup', () => { if (popup.isConnected) popup.remove(); });
}
