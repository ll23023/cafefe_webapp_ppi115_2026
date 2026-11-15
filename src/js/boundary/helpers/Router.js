/**
 * Ayuda para coordinar cambios de página y paneles.
 *
 * @author MikeLB
 */
class Router {
    #paneles = new Map();
    #contenido;

    constructor(contenido) { this.#contenido = contenido; }
    registrar(ruta, panel) { this.#paneles.set(ruta, panel); }
    navegar(ruta) {
        const panel = this.#paneles.get(ruta);
        if (!panel) return false;
        this.#contenido.mostrar(panel);
        return true;
    }
}

if (typeof globalThis !== 'undefined') globalThis.Router = Router;
if (typeof module !== 'undefined') module.exports = Router;
