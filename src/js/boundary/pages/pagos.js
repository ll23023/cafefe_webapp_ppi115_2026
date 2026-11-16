import { generarFacturaPdf } from './factura.js';
import { FacturaService } from '../../control/FacturaService.js';
import { PagoService } from '../../control/PagoService.js';
import { PagoDetalleService } from '../../control/PagoDetalleService.js';
import { Session } from '../../control/Session.js';
import { PAGOS_API_ACTIVA } from '../../config.js';

export function renderPagos(store) {
    const view = document.createElement('section');
    view.innerHTML = `<div class="page-header"><h1>Ordenes pendientes de pago</h1></div><p class="payment-caja" role="status"></p><div class="orders-grid"></div>`;
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
    store.ordenesPendientesPago.forEach((orden) => { const row = document.createElement('div'); row.className = 'payment-row'; row.innerHTML = `<button type="button"><strong>Orden ${orden.id}</strong><span>${orden.cliente}</span></button><span class="status-filter">PENDIENTE</span>`; row.querySelector('button').addEventListener('click', () => detallePago(view, store, orden)); grid.appendChild(row); });
    return view;
}

function detallePago(view, store, orden) {
    const popup = document.createElement('app-popup'); popup.setAttribute('variante', 'vacio'); popup.setAttribute('titulo', `Orden ${orden.id}`); popup.setAttribute('descripcion', orden.cliente); popup.innerHTML = `<div class="modal-items">${orden.items.map((item) => `<div class="modal-item"><span>${item.cantidad} x ${item.titulo}</span><strong>${item.precio}</strong></div>`).join('')}</div><custom-barra-inferior texto="${orden.total}" texto-secundario="Cancelar" texto-primario="Metodo de pago"></custom-barra-inferior>`; view.appendChild(popup); popup.show();
    popup.addEventListener('cerrar-popup', () => popup.remove());
    popup.querySelector('custom-barra-inferior').addEventListener('barra-accion', (event) => { if (event.detail.accion === 'secundario') popup.close('cancelar'); if (event.detail.accion === 'primario') metodoPago(view, popup, store, orden); });
}

function metodoPago(view, anterior, store, orden) {
    const popup = document.createElement('app-popup'); popup.setAttribute('variante', 'vacio'); popup.setAttribute('titulo', 'Escoge el o los metodos de pago a utilizar para pagar'); popup.setAttribute('descripcion', `Cantidad a pagar ${orden.total}`); popup.innerHTML = `<form class="modal-form"><label><span>Efectivo</span><button type="button" class="calculate-payment status-filter">Calcular</button><input name="efectivo" class="payment-input" inputmode="decimal" placeholder="$0.00"></label><label><span>Tarjeta</span><input name="tarjeta" class="payment-input" inputmode="decimal" placeholder="$0.00"></label><label><span>QR</span><input name="qr" class="payment-input" inputmode="decimal" placeholder="$0.00"></label></form><custom-barra-inferior texto="" texto-secundario="Cancelar" texto-primario="Completar pago"></custom-barra-inferior>`; view.appendChild(popup); popup.show();
    popup.addEventListener('cerrar-popup', () => popup.remove());
    popup.querySelector('custom-barra-inferior').addEventListener('barra-accion', (event) => { if (event.detail.accion === 'secundario') popup.close('cancelar'); if (event.detail.accion === 'primario') confirmarPago(view, popup, store, orden); });
    popup.querySelector('.calculate-payment').addEventListener('click', () => repartirMonto(popup, orden));
}

function repartirMonto(popup, orden) {
    const inputs = [...popup.querySelectorAll('.payment-input')];
    const total = Number(String(orden.total).replace('$', '')) || 0;
    const valor = (input) => Number(String(input.value).replace('$', '').replace(',', '.')) || 0;
    const ingresado = inputs.reduce((suma, input) => suma + valor(input), 0);
    const vacios = inputs.filter((input) => valor(input) <= 0);
    if (!vacios.length) return;
    const reparto = Math.max(0, total - ingresado) / vacios.length;
    vacios.forEach((input) => { input.value = reparto.toFixed(2); });
}

function confirmarPago(view, anterior, store, orden) {
    const pagos = Object.fromEntries([...anterior.querySelectorAll('.payment-input')].map((input) => [input.name, input.value]));
    const popup = document.createElement('app-popup'); popup.setAttribute('titulo', 'Quieres completar el pago?'); popup.setAttribute('descripcion', 'Asegurate de revisar los montos antes de completar la orden.'); popup.setAttribute('texto-cancelar', 'No, dejame revisar'); popup.setAttribute('texto-aceptar', 'Si, completar'); view.appendChild(popup); popup.show(); popup.addEventListener('aceptar-popup', async () => { const ventanaFactura = window.open('', '_blank', 'width=480,height=720'); try { await registrarPagoApi(orden, pagos, store); store.marcarOrdenPagada(orden.id); generarFacturaPdf(orden, pagos, ventanaFactura); anterior.remove(); popup.remove(); } catch (error) { ventanaFactura?.close(); popup.setAttribute('descripcion', error.message); } }); popup.addEventListener('cerrar-popup', () => { if (popup.isConnected) popup.remove(); });
}

async function registrarPagoApi(orden, pagos, store) {
    if (!PAGOS_API_ACTIVA) return { facturaId: `local-${orden.id}`, origen: 'local' };
    try {
        const sesion = await Session.asegurarCaja(store.estado.sesion);
        store.estado.sesion = sesion;
        const facturaId = await new FacturaService().create({ idCaja: sesion.idCaja, idEmpleadoRol: sesion.idEmpleadoRol, cliente: orden.cliente, estado: 'PAGADA', observaciones: `Orden ${orden.id}` });
        const pagoId = await new PagoService().create({ idFactura: facturaId, estado: 'COMPLETADO', observaciones: `Orden ${orden.id}` });
        const detalles = Object.entries(pagos).filter(([, monto]) => Number(String(monto).replace('$', '')) > 0);
        await Promise.all(detalles.map(([tipoPago, monto]) => new PagoDetalleService().create({ idPago: pagoId, monto: Number(String(monto).replace('$', '')), tipoPago: tipoPago.toUpperCase() })));
        return { facturaId, origen: 'api' };
    } catch (error) {
        if (error?.status !== 0 && !/Failed to fetch|fetch|Network|connection refused/i.test(error?.message ?? '')) throw error;
        return { facturaId: `local-${orden.id}`, origen: 'local' };
    }
}

