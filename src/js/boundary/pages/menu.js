import { mostrarNotificacion } from '../helpers/notificaciones.js';

const normalizarId = (valor) => String(valor ?? '').trim().toLowerCase();
const normalizarNombre = (valor) => String(valor ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
const extraerId = (valor) => {
    if (typeof valor === 'string' || typeof valor === 'number') return normalizarId(valor);
    if (!valor || typeof valor !== 'object') return '';
    return normalizarId(valor.uid ?? valor.idTipoProducto ?? valor.id ?? '');
};

export function renderMenu(store, navigate) {
    const view = document.createElement('section');
    const categorias = store.categorias.map((categoria) => typeof categoria === 'string'
        ? { id: categoria, nombre: categoria }
        : categoria);
    const filtros = JSON.stringify(categorias)
        .replaceAll('&', '&amp;')
        .replaceAll("'", '&#39;');
    const registros = JSON.stringify(store.productos)
        .replaceAll('&', '&amp;')
        .replaceAll("'", '&#39;');
    const estadoCatalogo = store.estadoCatalogo;
    const estadoCategorias = {
        error: 'No se pudieron obtener las categorías',
        vacio: 'No existe ninguna categoría',
        cargando: 'Cargando categorías...'
    };
    const estadoProductos = {
        error: 'No se pudieron obtener los productos',
        vacio: 'No existe ningún producto',
        cargando: 'Cargando productos...'
    };
    const categoriasMarkup = estadoCatalogo.categorias === 'listo'
        ? `<carrusel-filtros filtros='${filtros}'></carrusel-filtros>`
        : `<p class="menu-state" role="${estadoCatalogo.categorias === 'error' ? 'alert' : 'status'}">${estadoCategorias[estadoCatalogo.categorias] ?? ''}</p>`;
    const productosMarkup = estadoCatalogo.productos === 'listo'
        ? `<rejilla-tarjetas registros='${registros}'></rejilla-tarjetas>`
        : `<p class="menu-state" role="${estadoCatalogo.productos === 'error' ? 'alert' : 'status'}">${estadoProductos[estadoCatalogo.productos] ?? ''}</p>`;

    view.innerHTML = `<div class="page-header"><h1>Elige tu proximo cafe</h1><span class="status-filter">${store.estado.carrito.length} productos</span></div><div class="menu-tools">${categoriasMarkup}</div><div class="menu-products">${productosMarkup}</div><div class="cart-fab"><custom-boton-flotante texto="Ver carrito" aria-label="Ver carrito"></custom-boton-flotante></div>`;
    const rejilla = view.querySelector('rejilla-tarjetas');
    const categoriasSeleccionadas = new Set();
    view.addEventListener('filtro-seleccionado', (event) => {
        const categoria = normalizarId(event.detail.uid ?? event.detail.categoria);
        if (!categoria) return;
        categoriasSeleccionadas.clear();
        if (event.detail.activo) categoriasSeleccionadas.add(categoria);
        if (!rejilla) return;
        const nombresSeleccionados = new Set(store.categorias
            .filter((tipo) => categoriasSeleccionadas.has(normalizarId(tipo.uid ?? tipo.id)))
            .map((tipo) => normalizarNombre(tipo.nombre)));
        const registros = categoriasSeleccionadas.size
            ? store.productos.filter((producto) => {
                const ids = [
                    ...(Array.isArray(producto.categoriaUids) ? producto.categoriaUids : []),
                    producto.categoriaUid,
                    producto.uidTipoProducto,
                    producto.idTipoProducto,
                    producto.tipoProducto?.uid,
                    producto.tipoProducto?.idTipoProducto,
                    producto.categoria?.uid,
                    producto.categoria?.idTipoProducto
                ].map(extraerId).filter(Boolean);
                const nombres = [
                    typeof producto.categoria === 'string' ? producto.categoria : '',
                    producto.categoria?.nombre,
                    producto.tipoProducto?.nombre
                ].map(normalizarNombre).filter(Boolean);
                return ids.some((id) => categoriasSeleccionadas.has(id)) ||
                    nombres.some((nombre) => nombresSeleccionados.has(nombre));
            })
            : store.productos;
        rejilla.setAttribute('registros', JSON.stringify(registros));
    });
    view.addEventListener('tarjeta-agregar', (event) => {
        const producto = store.productos.find((item) => item.uid === event.detail.uid) ??
            store.productos.find((item) => item.titulo === event.detail.titulo);
        if (!producto) return;
        store.agregar(producto);
        mostrarNotificacion(`${producto.titulo} agregado al carrito`);
    });
    view.querySelector('custom-boton-flotante').addEventListener('click', () => navigate('carrito'));
    return view;
}
