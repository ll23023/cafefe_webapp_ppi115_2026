import { Session } from './control/Session.js';
import { ProductoService } from './control/ProductoService.js';
import { TipoProductoService } from './control/TipoProductoService.js';
import { ProductoTipoProductoService } from './control/ProductoTipoProductoService.js';

const ordenes = [
    { id: '8687-gs65j-56lf-d8hd', cliente: 'Esteban Quito', estado: 'pendiente', total: '$25.00', items: [{ titulo: 'Capuchino', cantidad: 2, precio: '$7.00' }, { titulo: 'Croissant', cantidad: 2, precio: '$5.50' }] },
    { id: '4hu34-34hi-34hu34-67sdf', cliente: 'Ana Morales', estado: 'listo', total: '$30.00', items: [{ titulo: 'Latte vainilla', cantidad: 2, precio: '$8.50' }, { titulo: 'Brownie', cantidad: 2, precio: '$6.50' }] },
    { id: '72ks2-9as8d-1plm-44kde', cliente: 'Luis Perez', estado: 'pendiente', total: '$18.50', items: [{ titulo: 'Americano', cantidad: 2, precio: '$4.00' }, { titulo: 'Te chai', cantidad: 1, precio: '$3.00' }] }
];

const sesionInicial = Session.leer();
const ORDENES_CLAVE = 'cafefe-orders';
const COLA_OFFLINE_CLAVE = 'offline_orders_queue';
const leerOrdenes = () => {
    try { return JSON.parse(localStorage.getItem(ORDENES_CLAVE) || 'null'); }
    catch { return null; }
};
let errorColaOffline = null;
const leerColaOffline = () => {
    try {
        const valor = JSON.parse(localStorage.getItem(COLA_OFFLINE_CLAVE) || '[]');
        if (!Array.isArray(valor) || valor.some((entrada) =>
            !entrada || typeof entrada.idTemporal !== 'string' || !entrada.orden ||
            typeof entrada.orden.id !== 'string' || !Array.isArray(entrada.orden.items)
        )) {
            throw new TypeError('La cola offline no tiene un formato válido.');
        }
        return valor;
    } catch (error) {
        errorColaOffline = error;
        console.error('No se pudo leer la cola de órdenes offline:', error);
        return [];
    }
};
const colaOffline = leerColaOffline();
const ordenesGuardadas = leerOrdenes();
const ordenesBase = ordenesGuardadas ?? (sesionInicial?.ordenes?.length
    ? sesionInicial.ordenes
    : ordenes.map((orden) => ({ ...orden, items: orden.items.map((item) => ({ ...item })) })));
const ordenesConColaOffline = [...ordenesBase];
colaOffline.forEach((entrada) => {
    if (entrada?.orden && !ordenesConColaOffline.some((orden) => orden.id === entrada.orden.id)) {
        ordenesConColaOffline.push(entrada.orden);
    }
});
const estado = {
    sesion: sesionInicial,
    usuario: sesionInicial?.nombre ?? '',
    carrito: sesionInicial?.carrito ?? [],
    ordenes: ordenesConColaOffline
};
const listeners = new Set();
const catalogo = {
    productos: [],
    categorias: [],
    estadoProductos: 'cargando',
    estadoCategorias: 'cargando'
};
const emitir = () => {
    localStorage.setItem(ORDENES_CLAVE, JSON.stringify(estado.ordenes));
    if (estado.sesion) Session.guardar({ ...estado.sesion, carrito: estado.carrito, ordenes: estado.ordenes });
    listeners.forEach((listener) => listener(estado));
};

const idDe = (valor, ...claves) => {
    if (typeof valor === 'string') return valor;
    if (!valor || typeof valor !== 'object') return null;
    return claves.map((clave) => valor[clave]).find(Boolean) ?? null;
};

export const store = {
    get productos() { return catalogo.productos; },
    get categorias() { return catalogo.categorias; },
    get estadoCatalogo() {
        return {
            productos: catalogo.estadoProductos,
            categorias: catalogo.estadoCategorias
        };
    },
    ordenes,
    get estado() { return estado; },
    get ordenesActuales() {
        return estado.ordenes;
    },
    get ordenesOfflinePendientes() {
        return colaOffline;
    },
    get errorColaOffline() {
        return errorColaOffline;
    },
    esOrdenOfflinePendiente(id) {
        return colaOffline.some((entrada) => entrada.idTemporal === id);
    },
    get ordenesPendientesDespacho() { return this.ordenesActuales.filter((orden) => orden.estado === 'pendiente'); },
    get ordenesPendientesPago() { return this.ordenesActuales.filter((orden) => orden.estado === 'listo' && orden.estadoPago !== 'pagado'); },
    persistir() {
        localStorage.setItem(ORDENES_CLAVE, JSON.stringify(this.ordenesActuales));
        if (estado.sesion) Session.guardar({ ...estado.sesion, carrito: estado.carrito, ordenes: this.ordenesActuales });
    },
    suscribir(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    async cargarCatalogo() {
        catalogo.productos = [];
        catalogo.categorias = [];
        catalogo.estadoProductos = 'cargando';
        catalogo.estadoCategorias = 'cargando';

        const [productosResultado, categoriasResultado, relacionesResultado] = await Promise.allSettled([
            new ProductoService().findRange(0, 50),
            new TipoProductoService().findAll(),
            new ProductoTipoProductoService().findRange(0, 50)
        ]);

        const tipos = categoriasResultado.status === 'fulfilled'
            ? categoriasResultado.value.registros
            : [];
        const tiposPorId = new Map(tipos.map((tipo) => [
            tipo.idTipoProducto,
            tipo
        ]));

        if (categoriasResultado.status === 'fulfilled') {
            catalogo.categorias = tipos
                .filter((tipo) => tipo.activo !== false)
                .map((tipo) => ({
                    id: tipo.idTipoProducto,
                    uid: tipo.idTipoProducto,
                    nombre: tipo.nombre
                }));
            catalogo.estadoCategorias = catalogo.categorias.length ? 'listo' : 'vacio';
        } else {
            catalogo.estadoCategorias = 'error';
            console.error('No se pudieron obtener las categorías:', categoriasResultado.reason);
        }

        const relaciones = relacionesResultado.status === 'fulfilled'
            ? relacionesResultado.value.registros
            : [];
        if (relacionesResultado.status === 'rejected') {
            console.error('No se pudieron obtener las categorías asociadas a los productos:', relacionesResultado.reason);
        }

        const categoriaPorProducto = new Map(relaciones.map((relacion) => {
            const productoId = idDe(relacion.idProducto, 'uid', 'idProducto', 'id');
            const tipoId = idDe(relacion.idTipoProducto, 'uid', 'idTipoProducto', 'id');
            return [productoId, {
                id: tipoId,
                nombre: tiposPorId.get(tipoId)?.nombre ?? relacion.idTipoProducto?.nombre ?? ''
            }];
        }).filter(([productoId]) => productoId));

        if (productosResultado.status === 'fulfilled') {
            catalogo.productos = productosResultado.value.registros
                .filter((producto) => producto.activo !== false)
                .map((producto) => {
                    const uid = producto.idProducto;
                    const categoria = categoriaPorProducto.get(uid);
                    const nombreCategoria = categoria?.nombre ?? producto.tipoProducto?.nombre ?? '';
                    return {
                        id: uid,
                        uid,
                        titulo: producto.nombre,
                        categoriaUid: categoria?.id ?? null,
                        categoria: nombreCategoria || 'Sin categoría',
                        descripcion: producto.comentarios || 'Producto de Cafefe',
                        precio: `$${Number(producto.precioSugerido ?? 0).toFixed(2)}`
                    };
                });
            catalogo.estadoProductos = catalogo.productos.length ? 'listo' : 'vacio';
        } else {
            catalogo.estadoProductos = 'error';
            console.error('No se pudieron obtener los productos:', productosResultado.reason);
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
        const sinConexion = typeof navigator !== 'undefined' && !navigator.onLine;
        const orden = {
            id: crypto.randomUUID(),
            cliente,
            estado: 'pendiente',
            estadoPago: 'pendiente',
            total: `$${formatearTotal(estado.carrito)}`,
            items: estado.carrito.map((item) => ({ ...item }))
        };
        if (sinConexion) {
            if (errorColaOffline) {
                throw new Error('No se pudo recuperar la cola de órdenes offline; no se guardó esta orden.');
            }
            orden.estadoSincronizacion = 'pendiente';
            const entrada = {
                idTemporal: orden.id,
                estado: 'pendiente',
                creadaEn: new Date().toISOString(),
                orden
            };
            const colaActualizada = [...colaOffline, entrada];
            localStorage.setItem(COLA_OFFLINE_CLAVE, JSON.stringify(colaActualizada));
            colaOffline.push(entrada);
            errorColaOffline = null;
        }
        estado.ordenes.push(orden);
        estado.carrito = [];
        emitir();
        return orden;
    },
    marcarOrdenPagada(id) {
        const orden = estado.ordenes.find((registro) => registro.id === id) || ordenes.find((registro) => registro.id === id);
        if (this.esOrdenOfflinePendiente(id) || orden?.estadoSincronizacion === 'pendiente') return false;
        if (orden) {
            orden.estadoPago = 'pagado';
            orden.bloqueada = true;
        }
        emitir();
        return Boolean(orden);
    },
    cerrarSesion() { Session.limpiar(); estado.sesion = null; estado.usuario = ''; estado.carrito = []; emitir(); }
};

export const formatearTotal = (items) => items.reduce((total, item) => total + Number(String(item.precio).replace('$', '')) * (item.cantidad || 1), 0).toFixed(2);
