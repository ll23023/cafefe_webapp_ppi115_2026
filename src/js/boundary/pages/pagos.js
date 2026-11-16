import { generarFacturaPdf } from './factura.js';
import { FacturaService } from '../../control/FacturaService.js';
import { PagoService } from '../../control/PagoService.js';
import { PagoDetalleService } from '../../control/PagoDetalleService.js';
import { Session } from '../../control/Session.js';
import { PAGOS_API_ACTIVA } from '../../config.js';
import { mostrarNotificacion } from '../helpers/notificaciones.js';

export function renderPagos(store) {
    const view = document.createElement('section');
    view.innerHTML = `<div class="page-header"><h1>Ordenes pendientes de pago</h1></div><p class="payment-connection-status" role="status"></p><p class="payment-caja" role="status"></p><div class="orders-grid"></div>`;
    const connectionStatus = view.querySelector('.payment-connection-status');
    const pendientesSync = store.ordenesOfflinePendientes?.length ?? 0;
    if (!navigator.onLine) {
        connectionStatus.textContent = 'Se requiere conexión a internet para procesar pagos.';
    } else if (pendientesSync) {
        connectionStatus.textContent = `Hay ${pendientesSync} orden(es) pendientes. Se requiere una actualización de la API para sincronizarlas de forma segura.`;
    } else {
        connectionStatus.remove();
    }
    const cajaEstado = view.querySelector('.payment-caja');
    const sesion = store.estado.sesion;
    if (Session.esCajero(sesion)) {
        cajaEstado.textContent = sesion.caja?.nombre
            ? `Caja vinculada: ${sesion.caja.nombre}`
            : 'Cargando caja...';
        Session.asegurarCaja(sesion).then((sesionActualizada) => {
            store.estado.sesion = sesionActualizada;
            cajaEstado.textContent = `Caja vinculada: ${sesionActualizada.caja.nombre || sesionActualizada.idCaja}`;
        }).catch((error) => {
            cajaEstado.setAttribute('role', 'alert');
            cajaEstado.textContent = error.message;
        });
    } else {
        cajaEstado.remove();
    }

    const grid = view.querySelector('.orders-grid');
    store.ordenesPendientesPago.forEach((orden) => {
        const row = document.createElement('div');
        row.className = 'payment-row';
        const estado = store.esOrdenOfflinePendiente(orden.id) || orden.estadoSincronizacion === 'pendiente'
            ? 'PENDIENTE DE SINCRONIZACIÓN'
            : 'PENDIENTE';
        row.innerHTML = `<button type="button"><strong>Orden ${orden.id}</strong><span>${orden.cliente}</span></button><span class="status-filter">${estado}</span>`;
        row.querySelector('button').addEventListener('click', () => detallePago(view, store, orden));
        grid.appendChild(row);
    });
    return view;
}

function motivoBloqueoPago(orden, store) {
    if (!navigator.onLine) return 'Se requiere conexión a internet para procesar pagos.';
    if (store.esOrdenOfflinePendiente(orden.id) || orden.estadoSincronizacion === 'pendiente') {
        return 'La orden está pendiente de sincronización y no puede pagarse.';
    }
    return '';
}

function detallePago(view, store, orden) {
    const popup = document.createElement('app-popup');
    popup.setAttribute('variante', 'vacio');
    popup.setAttribute('titulo', `Orden ${orden.id}`);
    popup.setAttribute('descripcion', orden.cliente);
    const motivo = motivoBloqueoPago(orden, store);
    popup.innerHTML = `<div class="modal-items">${orden.items.map((item) => `<div class="modal-item"><span>${item.cantidad} x ${item.titulo}</span><strong>${item.precio}</strong></div>`).join('')}</div><p class="payment-block-message" role="status">${motivo}</p><custom-barra-inferior texto="${orden.total}" texto-secundario="Cancelar" texto-primario="Metodo de pago" ${motivo ? 'disabled-primario' : ''}></custom-barra-inferior>`;
    view.appendChild(popup);
    popup.show();
    popup.addEventListener('cerrar-popup', () => popup.remove());
    popup.querySelector('custom-barra-inferior').addEventListener('barra-accion', (event) => {
        if (event.detail.accion === 'secundario') popup.close('cancelar');
        if (event.detail.accion === 'primario') metodoPago(view, popup, store, orden);
    });
}

function metodoPago(view, anterior, store, orden) {
    const motivoInicial = motivoBloqueoPago(orden, store);
    if (motivoInicial) {
        mostrarNotificacion(motivoInicial, 'fracaso');
        return;
    }
    const popup = document.createElement('app-popup');
    popup.setAttribute('variante', 'vacio');
    popup.setAttribute('titulo', 'Escoge el o los metodos de pago a utilizar para pagar');
    popup.setAttribute('descripcion', `Cantidad a pagar ${orden.total}`);
    popup.innerHTML = `<p class="payment-block-message" role="status"></p><form class="modal-form"><label><span>Efectivo</span><button type="button" class="calculate-payment status-filter">Calcular</button><input name="efectivo" class="payment-input" inputmode="decimal" placeholder="$0.00"></label><label><span>Tarjeta</span><input name="tarjeta" class="payment-input" inputmode="decimal" placeholder="$0.00"></label><label><span>QR</span><input name="qr" class="payment-input" inputmode="decimal" placeholder="$0.00"></label></form><custom-barra-inferior texto="" texto-secundario="Cancelar" texto-primario="Completar pago" disabled-primario></custom-barra-inferior>`;
    view.appendChild(popup);
    popup.show();

    const inputs = [...popup.querySelectorAll('.payment-input')];
    const barra = popup.querySelector('custom-barra-inferior');
    const estadoPago = popup.querySelector('.payment-block-message');
    const actualizarValidacion = () => {
        const motivo = motivoBloqueoPago(orden, store);
        estadoPago.textContent = motivo;
        barra.toggleAttribute('disabled-primario', Boolean(motivo) || !montosCoinciden(orden, inputs));
    };
    inputs.forEach((input) => input.addEventListener('input', actualizarValidacion));
    barra.addEventListener('barra-accion', (event) => {
        if (event.detail.accion === 'secundario') popup.close('cancelar');
        if (event.detail.accion === 'primario') confirmarPago(view, popup, store, orden);
    });
    popup.querySelector('.calculate-payment').addEventListener('click', () => repartirMonto(orden, inputs, actualizarValidacion));
    actualizarValidacion();
    popup.addEventListener('cerrar-popup', () => popup.remove());
}

function aCentavos(valor) {
    const limpio = String(valor ?? '').trim().replace('$', '').replace(',', '.');
    if (!limpio) return 0;
    const numero = Number(limpio);
    if (!Number.isFinite(numero) || numero < 0) return null;
    return Math.round((numero + Number.EPSILON) * 100);
}

function montosCoinciden(orden, inputs) {
    const total = aCentavos(orden.total);
    const montos = inputs.map((input) => aCentavos(input.value));
    return total !== null && montos.every((monto) => monto !== null) &&
        montos.reduce((suma, monto) => suma + monto, 0) === total;
}

function repartirMonto(orden, inputs, actualizarValidacion) {
    const total = aCentavos(orden.total);
    const montos = inputs.map((input) => aCentavos(input.value));
    if (total === null || montos.some((monto) => monto === null)) return;

    const vacios = montos.map((monto, indice) => monto === 0 ? indice : -1).filter((indice) => indice >= 0);
    if (!vacios.length) return;

    const restante = Math.max(0, total - montos.reduce((suma, monto) => suma + monto, 0));
    const base = Math.floor(restante / vacios.length);
    const sobrante = restante % vacios.length;
    vacios.forEach((indice, posicion) => {
        inputs[indice].value = ((base + (posicion < sobrante ? 1 : 0)) / 100).toFixed(2);
    });
    actualizarValidacion();
}

function confirmarPago(view, anterior, store, orden) {
    const motivo = motivoBloqueoPago(orden, store);
    if (motivo) {
        mostrarNotificacion(motivo, 'fracaso');
        return;
    }
    const inputs = [...anterior.querySelectorAll('.payment-input')];
    if (!montosCoinciden(orden, inputs)) {
        mostrarNotificacion('La suma de los métodos de pago debe coincidir con el total de la orden.', 'fracaso');
        return;
    }

    const popup = document.createElement('app-popup');
    popup.setAttribute('titulo', 'Quieres completar el pago?');
    popup.setAttribute('descripcion', 'Asegurate de revisar los montos antes de completar la orden.');
    popup.setAttribute('texto-cancelar', 'No, dejame revisar');
    popup.setAttribute('texto-aceptar', 'Si, completar');
    view.appendChild(popup);
    popup.show();
    popup.addEventListener('aceptar-popup', async () => {
        const bloqueo = motivoBloqueoPago(orden, store);
        if (bloqueo) {
            popup.setAttribute('descripcion', bloqueo);
            return;
        }
        if (!montosCoinciden(orden, inputs)) {
            popup.setAttribute('descripcion', 'La suma de los métodos de pago debe coincidir con el total de la orden.');
            return;
        }
        const pagos = Object.fromEntries(inputs.map((input) => [input.name, input.value]));
        const ventanaFactura = window.open('', '_blank', 'width=480,height=720');
        try {
            await registrarPagoApi(orden, pagos, store);
            store.marcarOrdenPagada(orden.id);
            generarFacturaPdf(orden, pagos, ventanaFactura);
            anterior.remove();
            popup.remove();
            mostrarNotificacion(`Pago completado para la orden ${orden.id}.`);
        } catch (error) {
            ventanaFactura?.close();
            popup.setAttribute('descripcion', error.message);
        }
    });
    popup.addEventListener('cerrar-popup', () => {
        if (popup.isConnected) popup.remove();
    });
}

async function registrarPagoApi(orden, pagos, store) {
    if (!navigator.onLine) throw new Error('Se requiere conexión a internet para procesar pagos.');
    if (!PAGOS_API_ACTIVA) throw new Error('El registro de pagos en la API no está disponible.');
    if (store.esOrdenOfflinePendiente(orden.id) || orden.estadoSincronizacion === 'pendiente') {
        throw new Error('La orden está pendiente de sincronización y no puede pagarse.');
    }

    const sesion = await Session.asegurarCaja(store.estado.sesion);
    store.estado.sesion = sesion;
    const facturaId = await new FacturaService().create({ idCaja: sesion.idCaja, idEmpleadoRol: sesion.idEmpleadoRol, cliente: orden.cliente, estado: 'PAGADA', observaciones: `Orden ${orden.id}` });
    const pagoId = await new PagoService().create({ idFactura: facturaId, estado: 'COMPLETADO', observaciones: `Orden ${orden.id}` });
    const detalles = Object.entries(pagos).filter(([, monto]) => Number(String(monto).replace('$', '')) > 0);
    await Promise.all(detalles.map(([tipoPago, monto]) => new PagoDetalleService().create({ idPago: pagoId, monto: Number(String(monto).replace('$', '')), tipoPago: tipoPago.toUpperCase() })));
    return { facturaId, origen: 'api' };
}

