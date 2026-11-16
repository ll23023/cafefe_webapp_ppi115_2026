import { Session } from './control/Session.js';
import { ProductoService } from './control/ProductoService.js';
import { TipoProductoService } from './control/TipoProductoService.js';
import { ProductoTipoProductoService } from './control/ProductoTipoProductoService.js';

const productos = [
    { id: 'americano', uid: 'americano', titulo: 'Americano', categoria: 'Cafe', categoriaUid: 'cafe', descripcion: 'Cafe filtrado y sedoso', precio: '$2.00', imagen: './assets/images/productos/americano.png' },
    { id: 'capuchino', uid: 'capuchino', titulo: 'Capuchino', categoria: 'Cafe', categoriaUid: 'cafe', descripcion: 'Espuma de leche y cacao', precio: '$3.50', imagen: './assets/images/productos/capuchino.png' },
    { id: 'latte', uid: 'latte', titulo: 'Latte vainilla', categoria: 'Cafe', categoriaUid: 'cafe', descripcion: 'Espresso, leche y vainilla', precio: '$4.25', imagen: './assets/images/productos/latte.png' },
    { id: 'te', uid: 'te', titulo: 'Te chai', categoria: 'Te', categoriaUid: 'te', descripcion: 'Especias, te negro y leche', precio: '$3.00', imagen: './assets/images/productos/te.png' },
    { id: 'croissant', uid: 'croissant', titulo: 'Croissant', categoria: 'Pan', categoriaUid: 'pan', descripcion: 'Horneado con mantequilla', precio: '$2.75', imagen: './assets/images/productos/croissant.png' },
    { id: 'brownie', uid: 'brownie', titulo: 'Brownie', categoria: 'Dulce', categoriaUid: 'dulce', descripcion: 'Chocolate intenso y nueces', precio: '$3.25', imagen: './assets/images/productos/brownie.png' }
];

const ordenes = [
    { id: '8687-gs65j-56lf-d8hd', cliente: 'Esteban Quito', estado: 'pendiente', total: '$25.00', items: [{ titulo: 'Capuchino', cantidad: 2, precio: '$7.00' }, { titulo: 'Croissant', cantidad: 2, precio: '$5.50' }] },
    { id: '4hu34-34hi-34hu34-67sdf', cliente: 'Ana Morales', estado: 'listo', total: '$30.00', items: [{ titulo: 'Latte vainilla', cantidad: 2, precio: '$8.50' }, { titulo: 'Brownie', cantidad: 2, precio: '$6.50' }] },
    { id: '72ks2-9as8d-1plm-44kde', cliente: 'Luis Perez', estado: 'pendiente', total: '$18.50', items: [{ titulo: 'Americano', cantidad: 2, precio: '$4.00' }, { titulo: 'Te chai', cantidad: 1, precio: '$3.00' }] }
];

const sesionInicial = Session.leer();
const ORDENES_CLAVE = 'cafefe-orders';
const leerOrdenes = () => {
    try { return JSON.parse(localStorage.getItem(ORDENES_CLAVE) || 'null'); }
    catch { return null; }
};
const ordenesGuardadas = leerOrdenes();
const estado = {
    sesion: sesionInicial,
    usuario: sesionInicial?.nombre ?? '',
    carrito: sesionInicial?.carrito ?? [],
    ordenes: ordenesGuardadas ?? (sesionInicial?.ordenes?.length ? sesionInicial.ordenes : ordenes.map((orden) => ({ ...orden, items: orden.items.map((item) => ({ ...item })) })))
};
const listeners = new Set();
const catalogo = {
    productos: [...productos],
    categorias: [
        { id: 'cafe', nombre: 'Cafe' },
        { id: 'te', nombre: 'Te' },
        { id: 'pan', nombre: 'Pan' },
        { id: 'dulce', nombre: 'Dulce' }
    ]
};
const emitir = () => {
    localStorage.setItem(ORDENES_CLAVE, JSON.stringify(estado.ordenes));
    if (estado.sesion) Session.guardar({ ...estado.sesion, carrito: estado.carrito, ordenes: estado.ordenes });
    listeners.forEach((listener) => listener(estado));
};

export const store = {
    get productos() { return catalogo.productos; },
    get categorias() { return catalogo.categorias; },
    ordenes,
    get estado() { return estado; },
    get ordenesActuales() {
        return estado.ordenes;
    },
    get ordenesPendientesDespacho() { return this.ordenesActuales.filter((orden) => orden.estado === 'pendiente'); },
    get ordenesPendientesPago() { return this.ordenesActuales.filter((orden) => orden.estado === 'listo' && orden.estadoPago !== 'pagado'); },
    persistir() {
        localStorage.setItem(ORDENES_CLAVE, JSON.stringify(this.ordenesActuales));
        if (estado.sesion) Session.guardar({ ...estado.sesion, carrito: estado.carrito, ordenes: this.ordenesActuales });
    },
    suscribir(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    async cargarCatalogo() {
        try {
            const [respuestaProductos, respuestaTipos, respuestaRelaciones] = await Promise.all([
                new ProductoService().findRange(0, 50),
                new TipoProductoService().findRange(0, 50),
                new ProductoTipoProductoService().findRange(0, 50)
            ]);
            const tipos = new Map(respuestaTipos.registros.map((tipo) => [
                tipo.uid ?? tipo.idTipoProducto ?? tipo.id,
                { id: tipo.uid ?? tipo.idTipoProducto ?? tipo.id, nombre: tipo.nombre }
            ]));
            const categoriaPorProducto = new Map(respuestaRelaciones.registros.map((relacion) => [
                relacion.idProducto?.uid ?? relacion.idProducto?.idProducto ?? relacion.idProducto?.id ?? relacion.idProducto,
                relacion.idTipoProducto?.uid ?? relacion.idTipoProducto?.idTipoProducto ?? relacion.idTipoProducto?.id ?? relacion.idTipoProducto
            ]));
            const apiProductos = respuestaProductos.registros.filter((producto) => producto.activo !== false).map((producto) => ({
                id: producto.uid ?? producto.idProducto ?? producto.id,
                uid: producto.uid ?? producto.idProducto ?? producto.id,
                titulo: producto.nombre,
                categoriaUid: categoriaPorProducto.get(producto.uid ?? producto.idProducto ?? producto.id) ?? null,
                categoria: tipos.get(categoriaPorProducto.get(producto.uid ?? producto.idProducto ?? producto.id))?.nombre || 'Sin categoria',
                descripcion: producto.comentarios || 'Producto de Cafefe',
                precio: `$${Number(producto.precioSugerido ?? 0).toFixed(2)}`,
                imagen: `./assets/images/productos/${encodeURIComponent(producto.uid ?? producto.idProducto ?? producto.id)}.png`
            }));
            if (apiProductos.length) catalogo.productos = apiProductos;
            const apiCategorias = [...tipos.values()].filter((tipo) => tipo.id && tipo.nombre);
            if (apiCategorias.length) catalogo.categorias = apiCategorias;
        } catch (error) {
            console.warn('Se conserva el catalogo temporal:', error.message);
        }
        return catalogo;
    },
    agregar(producto) {
        const existente = estado.carrito.find((item) => item.id === producto.id);
        if (existente) existente.cantidad += 1;
        else estado.carrito.push({ ...producto, cantidad: 1 });
        emitir();
    },
    actualizarCantidad(id, cantidad) {
        const item = estado.carrito.find((producto) => producto.id === id);
        if (item) item.cantidad = Math.max(1, Number(cantidad) || 1);
        emitir();
    },
    eliminar(id) { estado.carrito = estado.carrito.filter((item) => item.id !== id); emitir(); },
    cambiarOrden(id, cambios) {
        const orden = this.ordenesActuales.find((registro) => registro.id === id);
        if (orden?.bloqueada) return false;
        if (orden) Object.assign(orden, cambios);
        emitir();
        return Boolean(orden);
    },
    crearOrdenDesdeCarrito(cliente) {
        if (!estado.carrito.length) return null;
        const orden = {
            id: crypto.randomUUID(),
            cliente,
            estado: 'pendiente',
            estadoPago: 'pendiente',
            total: `$${formatearTotal(estado.carrito)}`,
            items: estado.carrito.map((item) => ({ ...item }))
        };
        estado.ordenes.push(orden);
        estado.carrito = [];
        emitir();
        return orden;
    },
    marcarOrdenPagada(id) {
        const orden = estado.ordenes.find((registro) => registro.id === id) || ordenes.find((registro) => registro.id === id);
        if (orden) {
            orden.estadoPago = 'pagado';
            orden.bloqueada = true;
        }
        emitir();
    },
    cerrarSesion() { Session.limpiar(); estado.sesion = null; estado.usuario = ''; estado.carrito = []; emitir(); }
};

export const formatearTotal = (items) => items.reduce((total, item) => total + Number(String(item.precio).replace('$', '')) * (item.cantidad || 1), 0).toFixed(2);
