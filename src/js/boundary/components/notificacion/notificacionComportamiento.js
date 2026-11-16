/**
 * Componente para mostrar notificaciones temporales.
 *
 * @author Mil
 */

class CustomNotificacion extends HTMLElement {

    static observedAttributes = ['texto', 'tipo', 'duracion'];
    static _template;

    static #DURACION_PREDETERMINADA = 5000;

    _isRendered = false;
    _renderPromise;
    #texto;
    #cerrar;
    #temporizador;
    #cerrada = false;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    async _getTemplate() {
        if (!CustomNotificacion._template) {
            CustomNotificacion._template = fetch('./js/boundary/components/notificacion/notificacionPlantilla.html')
                .then((response) => {
                    if (!response.ok) throw new Error(`Error al cargar la plantilla: ${response.statusText}`);
                    return response.text();
                })
                .then((html) => {
                    const template = new DOMParser().parseFromString(html, 'text/html')
                        .querySelector('[notificacion-plantilla]');
                    if (!template) throw new Error('No se encontró la plantilla de notificación.');
                    return template;
                });
        }
        return CustomNotificacion._template;
    }

    async _renderElement() {
        if (!this._renderPromise) {
            this._renderPromise = this._getTemplate().then((template) => {
                this.shadowRoot.appendChild(template.content.cloneNode(true));
                this.#texto = this.shadowRoot.querySelector('.notificacion__texto-atributo');
                this.#cerrar = this.shadowRoot.querySelector('.notificacion__cerrar');
                this.#temporizador = this.shadowRoot.querySelector('.notificacion__temporizador');
                this.#cerrar.addEventListener('click', () => this.cerrar());
                this.#temporizador.addEventListener('animationend', () => this.cerrar());
                this._isRendered = true;
            });
        }
        await this._renderPromise;
        this.#adoptarPropiedades();
        this.#render();
    }

    attributeChangedCallback(nombre, valorAnterior, valorNuevo) {
        if (valorAnterior === valorNuevo || !this.isConnected || !this._isRendered) return;
        this._renderElement().catch((error) => console.error(error));
    }

    connectedCallback() {
        this.#cerrada = false;
        this._renderElement().catch((error) => console.error(error));
    }

    get texto() {
        return this.getAttribute('texto') ?? '';
    }

    set texto(valor) {
        this.setAttribute('texto', valor == null ? '' : String(valor));
    }

    get tipo() {
        return this.getAttribute('tipo') === 'fracaso' ? 'fracaso' : 'exito';
    }

    set tipo(valor) {
        this.setAttribute('tipo', valor == null ? '' : String(valor));
    }

    get duracion() {
        const valor = Number(this.getAttribute('duracion'));
        return Number.isFinite(valor) && valor > 0
            ? valor
            : CustomNotificacion.#DURACION_PREDETERMINADA;
    }

    set duracion(valor) {
        this.setAttribute('duracion', valor == null ? '' : String(valor));
    }

    cerrar() {
        if (this.#cerrada) return;

        this.#cerrada = true;
        this.dispatchEvent(new CustomEvent('notificacion-cerrada', {
            bubbles: true,
            composed: true
        }));
        this.remove();
    }

    #adoptarPropiedades() {
        for (const propiedad of ['texto', 'tipo', 'duracion']) {
            if (Object.hasOwn(this, propiedad)) {
                const valor = this[propiedad];
                delete this[propiedad];
                this[propiedad] = valor;
            }
        }
    }

    #render() {
        this.#texto.textContent = this.texto;
        this.setAttribute('role', this.tipo === 'fracaso' ? 'alert' : 'status');
        this.setAttribute('aria-live', this.tipo === 'fracaso' ? 'assertive' : 'polite');

        const duracion = this.duracion;
        this.style.setProperty('--notificacion-duracion', `${duracion}ms`);
        this.#temporizador.style.animation = 'none';
        this.#temporizador.offsetWidth;
        this.#temporizador.style.animation = '';
    }
}

customElements.define('custom-notificacion', CustomNotificacion);