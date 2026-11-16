export function renderMenu(store, navigate) {
    const view = document.createElement('section');
    const categorias = store.categorias.map((categoria) => typeof categoria === 'string'
        ? { id: categoria, nombre: categoria }
        : categoria);
    const filtros = JSON.stringify(categorias).replaceAll("'", "&apos;");
    view.innerHTML = `<div class="page-header"><h1>Elige tu proximo cafe</h1><span class="status-filter">${store.estado.carrito.length} productos</span></div><div class="menu-tools"><carrusel-filtros filtros='${filtros}'></carrusel-filtros></div><rejilla-tarjetas registros='${JSON.stringify(store.productos).replaceAll("'", "&apos;")}'></rejilla-tarjetas><div class="cart-fab"><custom-boton-flotante texto="Ver carrito" aria-label="Ver carrito"></custom-boton-flotante></div><div class="toast" aria-live="polite"></div>`;
    const rejilla = view.querySelector('rejilla-tarjetas');
    const categoriasSeleccionadas = new Set();
    view.addEventListener('filtro-seleccionado', (event) => {
        const { categoria, activo } = event.detail;
        if (activo) categoriasSeleccionadas.add(categoria);
        else categoriasSeleccionadas.delete(categoria);
        const registros = categoriasSeleccionadas.size
            ? store.productos.filter((producto) => categoriasSeleccionadas.has(producto.categoriaUid ?? producto.categoria))
            : store.productos;
        rejilla.setAttribute('registros', JSON.stringify(registros));
    });
    view.addEventListener('tarjeta-agregar', (event) => {
        const producto = store.productos.find((item) => item.titulo === event.detail.titulo);
        if (!producto) return;
        store.agregar(producto);
        const toast = document.createElement('custom-notificacion');
        toast.setAttribute('texto', `${producto.titulo} agregado al carrito`);
        view.querySelector('.toast').replaceChildren(toast);
    });
    view.querySelector('custom-boton-flotante').addEventListener('click', () => navigate('carrito'));
    return view;
}
