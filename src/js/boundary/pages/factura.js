const esc = (valor) => String(valor ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const numero = (valor) => Number(String(valor ?? '').replace(',', '.').replace('$', '')) || 0;
const dinero = (valor) => `$${Number(valor).toFixed(2)}`;

function fechaActual() {
    return new Intl.DateTimeFormat('es-SV', {
        dateStyle: 'short',
        timeStyle: 'short'
    }).format(new Date());
}

function filasFactura(items) {
    return items.map((item) => {
        const cantidad = Number(item.cantidad) || 1;
        const subtotal = numero(item.precio);
        const unitario = subtotal / cantidad;
        return `<tr>
            <td>${esc(item.titulo)}</td>
            <td class="number">${cantidad}</td>
            <td class="number">${dinero(unitario)}</td>
            <td class="number">${dinero(subtotal)}</td>
        </tr>`;
    }).join('');
}

export function generarFacturaPdf(orden, pagos = {}, ventanaExistente = null) {
    const ventana = ventanaExistente || window.open('', '_blank', 'width=480,height=720');
    if (!ventana) {
        window.alert('El navegador bloqueo la factura. Permite ventanas emergentes para imprimirla.');
        return false;
    }

    const total = numero(orden.total);
    const metodos = Object.entries(pagos)
        .filter(([, valor]) => numero(valor) > 0)
        .map(([metodo, valor]) => `<li><span>${esc(metodo)}</span><strong>${dinero(numero(valor))}</strong></li>`)
        .join('');

    ventana.document.write(`<!doctype html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Factura ${esc(orden.id)}</title>
    <style>
        :root { color-scheme: light; }
        * { box-sizing: border-box; }
        body { width: 72mm; margin: 0 auto; padding: 5mm 3mm; color: #000; background: #fff; font: 12px/1.35 "Courier New", monospace; }
        header { text-align: center; }
        h1 { margin: 0; font-size: 18px; }
        p { margin: 2px 0; }
        .rule { margin: 10px 0; border: 0; border-top: 1px dashed #000; }
        .meta { display: grid; gap: 2px; margin-bottom: 8px; overflow-wrap: anywhere; }
        table { width: 100%; border-collapse: collapse; table-layout: fixed; }
        th, td { padding: 3px 0; vertical-align: top; text-align: left; overflow-wrap: anywhere; }
        th { border-bottom: 1px solid #000; font-size: 10px; }
        th:nth-child(1), td:nth-child(1) { width: 38%; }
        th:nth-child(2), td:nth-child(2) { width: 12%; }
        th:nth-child(3), td:nth-child(3) { width: 24%; }
        th:nth-child(4), td:nth-child(4) { width: 26%; }
        .number { text-align: right; }
        .total { display: flex; justify-content: space-between; margin-top: 8px; font-size: 15px; font-weight: bold; }
        .payments { margin: 10px 0 0; padding: 0; list-style: none; }
        .payments li { display: flex; justify-content: space-between; }
        footer { margin-top: 18px; text-align: center; }
        @page { size: 80mm auto; margin: 0; }
        @media print { body { width: 72mm; } }
    </style>
</head>
<body>
    <header>
        <h1>CAFEFE</h1>
        <p>Factura de consumo</p>
        <p>Gracias por tu compra</p>
    </header>
    <hr class="rule">
    <section class="meta">
        <strong>ORDEN: ${esc(orden.id)}</strong>
        <span>CLIENTE: ${esc(orden.cliente)}</span>
        <span>FECHA: ${esc(fechaActual())}</span>
    </section>
    <table>
        <thead><tr><th>Producto</th><th class="number">Cant.</th><th class="number">P. unit.</th><th class="number">Subtotal</th></tr></thead>
        <tbody>${filasFactura(orden.items)}</tbody>
    </table>
    <hr class="rule">
    <div class="total"><span>TOTAL</span><span>${dinero(total)}</span></div>
    ${metodos ? `<ul class="payments"><li><strong>Pagos</strong><strong></strong></li>${metodos}</ul>` : ''}
    <footer><p>Conserva este comprobante.</p><p>CAFEFE</p></footer>
</body>
</html>`);
    ventana.addEventListener('load', () => ventana.print(), { once: true });
    ventana.document.close();
    ventana.focus();
    return true;
}
