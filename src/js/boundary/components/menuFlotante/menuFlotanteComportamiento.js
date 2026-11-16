/**
 * Componente de menú flotante para acciones de sesión.
 *
 * @author Mil
 */

class CustomMenuFlotante extends HTMLElement {

    static observedAttributes = ['usuario', 'ruta-login'];
    static _template;

    _isRendered = false;
    _renderPromise;
    #saludo;
    #login;
    #salir;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    async _getTemplate() {
        if (!CustomMenuFlotante._template) {
            CustomMenuFlotante._template = fetch('./js/boundary/components/menuFlotante/menuFlotantePlantilla.html')
                .then((response) => {
                    if (!response.ok) throw new Error(`Error al cargar la plantilla: ${response.statusText}`);
                    return response.text();
                })
                .then((html) => {
                    const template = new DOMParser().parseFromString(html, 'text/html')
                        .querySelector('[menu-flotante-plantilla]');
                    if (!template) throw new Error('No se encontró la plantilla de menú flotante.');
                    return template;
                });
        }
        return CustomMenuFlotante._template;
    }

    async _renderElement() {
        if (!this._renderPromise) {
            this._renderPromise = this._getTemplate().then((template) => {
                this.shadowRoot.appendChild(template.content.cloneNode(true));
                this.#saludo = this.shadowRoot.querySelector('.menu-flotante__saludo');
                this.#login = this.shadowRoot.querySelector('.menu-flotante__boton--login');
                this.#salir = this.shadowRoot.querySelector('.menu-flotante__boton--salir');
                this.#login.addEventListener('click', () => this.#iniciarSesion());
                this.#salir.addEventListener('click', () => {
                    this.dispatchEvent(new CustomEvent('salir', { bubbles: true, composed: true }));
                });
                this._isRendered = true;
            });
        }
        await this._renderPromise;
        this.#adoptarPropiedades();
        this.#render();
    }

    attributeChangedCallback(nombre, valorAnterior, valorNuevo) {
        if (valorAnterior === valorNuevo || !this.isConnected || !this._isRendered) return;
        if (nombre === 'usuario') this._renderElement().catch((error) => console.error(error));
    }

    connectedCallback() {
        this._renderElement().catch((error) => console.error(error));
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