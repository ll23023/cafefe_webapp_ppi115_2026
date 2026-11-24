import { EmpleadoService } from './EmpleadoService.js';
import { EmpleadoRolService } from './EmpleadoRolService.js';
import { CajaService } from './CajaService.js';

const CLAVE = 'cafefe-session';
const normalizar = (valor) => String(valor ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
const nombreEmpleado = (empleado) => [empleado?.nombre, empleado?.apellido].filter(Boolean).join(' ').trim();
const nombreRol = (empleado) => empleado?.empleadoRolList?.map((relacion) => relacion?.idRol?.nombre ?? relacion?.rol?.nombre ?? '').filter(Boolean) ?? [];
const relacionEmpleado = (empleado) => empleado?.empleadoRolList?.find((relacion) => relacion?.idEmpleadoRol)?.idEmpleadoRol ?? null;

function rolCanonico(valor) {
    const rol = normalizar(valor);
    if (/^(cajero|caja)$/.test(rol)) return 'cajero';
    if (/barista/.test(rol)) return 'barista';
    if (/cocinero|cocina/.test(rol)) return 'cocinero';
    if (rol === 'cliente') return 'cliente';
    return null;
}

export class Session {
    static #empleadoService = new EmpleadoService();
    static #empleadoRolService = new EmpleadoRolService();
    static #cajaService = new CajaService();

    static leer() {
        try { return JSON.parse(sessionStorage.getItem(CLAVE) || 'null'); }
        catch { return null; }
    }

    static guardar(datos) {
        const sesion = {
            ...datos,
            creadaEn: datos.creadaEn ?? this.leer()?.creadaEn ?? new Date().toISOString()
        };
        sessionStorage.setItem(CLAVE, JSON.stringify(sesion));
        return sesion;
    }

    static limpiar() { sessionStorage.removeItem(CLAVE); }

    static async verificarConexion() {
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
            throw new Error('No hay conexión a internet.');
        }
        await this.#empleadoService.findRange(0, 1);
        return true;
    }

    static async iniciar(usuario, contrasena = '') {
        const nombre = String(usuario ?? '').trim();
        const password = String(contrasena ?? '').trim();
        if (!nombre) throw new Error('Escribe tu nombre para continuar.');

        if (typeof navigator !== 'undefined' && !navigator.onLine) {
            throw new Error('No hay conexión a internet.');
        }

        const empleados = (await this.#empleadoService.findRange(0, 50)).registros;

        if (!password) {
            return this.guardar({ tipo: 'cliente', nombre, empleado: null, carrito: [], ordenes: [] });
        }

        let empleado = empleados.find((registro) => normalizar(nombreEmpleado(registro)) === normalizar(nombre) || normalizar(registro.nombre) === normalizar(nombre));
        if (!empleado || password !== String(empleado.idEmpleado)) throw new Error('Usuario o contraseña incorrectos.');

        if (!empleado.empleadoRolList?.length && empleado.idEmpleado) {
            const relaciones = (await this.#empleadoRolService.findRange(0, 50)).registros;
            empleado.empleadoRolList = relaciones.filter((relacion) => relacion?.idEmpleado?.idEmpleado === empleado.idEmpleado);
        }
        const roles = nombreRol(empleado);
        const rol = roles.map(rolCanonico).find(Boolean);
        if (!rol || rol === 'cliente') throw new Error('El usuario no tiene un rol de empleado autorizado.');

        const sesion = this.guardar({
            tipo: 'empleado',
            nombre: nombreEmpleado(empleado) || nombre,
            empleado,
            idEmpleadoRol: relacionEmpleado(empleado),
            rol,
            caja: null,
            idCaja: null,
            carrito: [],
            ordenes: []
        });
        return rol === 'cajero' ? this.asegurarCaja(sesion) : sesion;
    }

    static esCliente(sesion) { return sesion?.tipo === 'cliente'; }
    static esEmpleado(sesion) { return sesion?.tipo === 'empleado'; }
    static esCajero(sesion) { return rolCanonico(sesion?.rol) === 'cajero'; }
    static async asegurarCaja(sesion = this.leer()) {
        if (!this.esCajero(sesion)) throw new Error('Solo un cajero puede vincular una caja.');
        if (sesion.caja?.idCaja && sesion.idCaja === sesion.caja.idCaja) return sesion;

        const cajas = (await this.#cajaService.findRange(0, 50)).registros
            .filter((registro) => registro.activo !== false);
        if (cajas.length !== 1) {
            throw new Error(cajas.length
                ? 'Se esperaba una única caja activa en la API.'
                : 'No existe una caja activa en la API.');
        }

        const caja = cajas[0];
        return this.guardar({ ...sesion, caja, idCaja: caja.idCaja });
    }

    static rutaInicial(sesion) {
        if (this.esCliente(sesion)) return 'menu';
        if (this.esCajero(sesion)) return 'pagos';
        if (['barista', 'cocinero'].includes(rolCanonico(sesion?.rol))) return 'ordenes';
        return null;
    }

    static puedeVerRuta(sesion, ruta) {
        if (!sesion) return ruta === 'login';
        if (this.esCliente(sesion)) return ['menu', 'carrito'].includes(ruta);
        if (this.esCajero(sesion)) return ruta === 'pagos';
        return ['barista', 'cocinero'].includes(rolCanonico(sesion.rol)) && ruta === 'ordenes';
    }
}
