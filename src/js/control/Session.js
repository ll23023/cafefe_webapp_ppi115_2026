import { EmpleadoService } from './EmpleadoService.js';
import { EmpleadoRolService } from './EmpleadoRolService.js';
import { CajaService } from './CajaService.js';
import { MOCK_EMPLOYEES } from './mockEmployees.js';

const CLAVE = 'cafefe-session';
const normalizar = (valor) => String(valor ?? '').trim().toLowerCase();
const nombreEmpleado = (empleado) => [empleado?.nombre, empleado?.apellido].filter(Boolean).join(' ').trim();
const nombreRol = (empleado) => empleado?.empleadoRolList?.map((relacion) => relacion?.idRol?.nombre ?? relacion?.rol?.nombre ?? '').filter(Boolean) ?? [];
const relacionEmpleado = (empleado) => empleado?.empleadoRolList?.find((relacion) => relacion?.idEmpleadoRol)?.idEmpleadoRol ?? null;

export class Session {
    static #empleadoService = new EmpleadoService();
    static #empleadoRolService = new EmpleadoRolService();
    static #cajaService = new CajaService();

    static leer() {
        try { return JSON.parse(sessionStorage.getItem(CLAVE) || 'null'); }
        catch { return null; }
    }

    static guardar(datos) {
        const sesion = { ...datos, creadaEn: new Date().toISOString() };
        sessionStorage.setItem(CLAVE, JSON.stringify(sesion));
        return sesion;
    }

    static limpiar() { sessionStorage.removeItem(CLAVE); }

    static async iniciar(usuario, contrasena = '') {
        const nombre = String(usuario ?? '').trim();
        const password = String(contrasena ?? '').trim();
        if (!nombre) throw new Error('Escribe tu nombre para continuar.');

        if (!password) {
            return this.guardar({ tipo: 'cliente', nombre, empleado: null, carrito: [], ordenes: [] });
        }

        let empleados = [];
        try {
            empleados = (await this.#empleadoService.findRange(0, 50)).registros;
        } catch (error) {
            empleados = MOCK_EMPLOYEES;
        }
        if (!empleados.length) empleados = MOCK_EMPLOYEES;

        let empleado = empleados.find((registro) => normalizar(nombreEmpleado(registro)) === normalizar(nombre) || normalizar(registro.nombre) === normalizar(nombre));
        if (!empleado) empleado = MOCK_EMPLOYEES.find((registro) => normalizar(nombreEmpleado(registro)) === normalizar(nombre));
        if (!empleado || password !== String(empleado.idEmpleado)) throw new Error('Usuario o contraseña incorrectos.');

        if (!empleado.empleadoRolList?.length && empleado.idEmpleado) {
            try {
                const relaciones = (await this.#empleadoRolService.findRange(0, 50)).registros;
                empleado.empleadoRolList = relaciones.filter((relacion) => relacion?.idEmpleado?.idEmpleado === empleado.idEmpleado);
            } catch {
                empleado.empleadoRolList = [];
            }
        }
        const roles = nombreRol(empleado);
        const rol = roles.find((valor) => /cajero|caja|barista|cocinero|cocina|camarero/i.test(valor)) ?? roles[0] ?? 'empleado';
        const rolSesion = /cajero|caja|camarero/i.test(rol) ? 'caja' : normalizar(rol);
        let caja = null;
        if (rolSesion === 'caja') {
            const cajas = (await this.#cajaService.findRange(0, 50)).registros.filter((registro) => registro.activo !== false);
            caja = cajas[0] ?? null;
            if (!caja) throw new Error('No existe una caja activa en la API.');
        }
        return this.guardar({ tipo: 'empleado', nombre: nombreEmpleado(empleado) || nombre, empleado, idEmpleadoRol: relacionEmpleado(empleado), idCaja: caja?.idCaja ?? null, rol: rolSesion, carrito: [], ordenes: [] });
    }

    static esCliente(sesion) { return sesion?.tipo === 'cliente'; }
    static esEmpleado(sesion) { return sesion?.tipo === 'empleado'; }
    static puedeVerRuta(sesion, ruta) {
        if (!sesion) return ruta === 'login';
        if (this.esCliente(sesion)) return ['menu', 'carrito'].includes(ruta);
        if (/caja|cajero/.test(normalizar(sesion.rol))) return ruta === 'pagos';
        return ruta === 'ordenes';
    }
}
