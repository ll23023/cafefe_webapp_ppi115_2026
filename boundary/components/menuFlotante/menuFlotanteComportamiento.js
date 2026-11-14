/**
 * Componente de menú flotante para acciones de sesión.
 *
 * @author Mil
 */

class CustomMenuFlotante extends HTMLElement {

    static observedAttributes = ['usuario', 'ruta-login'];

    #saludo;
    #login;
    #salir;

    constructor() {
        super();

        this.attachShadow({ mode: 'open' });

        const template = document.getElementById('custom-menu-flotante-template');
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this.#saludo = this.shadowRoot.querySelector('.menu-flotante__saludo');
        this.#login = this.shadowRoot.querySelector('.menu-flotante__boton--login');
        this.#salir = this.shadowRoot.querySelector('.menu-flotante__boton--salir');

        this.#login.addEventListener('click', () => this.#iniciarSesion());
        this.#salir.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('salir', { bubbles: true, composed: true }));
        });
    }

    connectedCallback() {
        this.#adoptarPropiedades();
        this.#render();
    }

    attributeChangedCallback(nombre, valorAnterior, valorNuevo) {
        if (valorAnterior === valorNuevo || !this.#saludo) return;
        if (nombre === 'usuario') this.#render();
    }

    get usuario() {
        return this.getAttribute('usuario') ?? '';
    }

    set usuario(valor) {
        const nombre = valor == null ? '' : String(valor);
        if (nombre) this.setAttribute('usuario', nombre);
        else this.removeAttribute('usuario');
    }

    get sesionIniciada() {
        return this.usuario !== '';
    }

    #iniciarSesion() {
        const evento = new CustomEvent('iniciar-sesion', {
            bubbles: true,
            composed: true,
            cancelable: true
        });
        const continuar = this.dispatchEvent(evento);
        const ruta = this.getAttribute('ruta-login');

        if (continuar && ruta) window.location.assign(ruta);
    }

    #adoptarPropiedades() {
        if (Object.hasOwn(this, 'usuario')) {
            const usuario = this.usuario;
            delete this.usuario;
            this.usuario = usuario;
        }
    }

    #render() {
        const iniciada = this.sesionIniciada;

        this.#saludo.textContent = iniciada ? `Hola, ${this.usuario}!` : 'Bienvenido';
        this.#login.hidden = iniciada;
        this.#salir.hidden = !iniciada;
    }
}

customElements.define('custom-menu-flotante', CustomMenuFlotante);