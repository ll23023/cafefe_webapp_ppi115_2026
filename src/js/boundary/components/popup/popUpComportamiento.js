/**
 * Ventana emergente para mensajes, advertencias y errores.
 *
 * @author MikeLB
 */
class PopUp extends HTMLElement {
    static observedAttributes = ['tipo', 'titulo', 'descripcion', 'alineacion', 'texto-aceptar', 'texto-cancelar', 'variante'];
    static _template;
    _renderPromise;
    #dialog;
    #titulo;
    #descripcion;
    #cerrar;
    #aceptar;
    #cancelar;
    #acciones;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    async _getTemplate() {
        if (!PopUp._template) {
            PopUp._template = fetch('/js/boundary/components/popup/popUpPlantilla.html')
                .then((response) => {
                    if (!response.ok) throw new Error(`Error al cargar la plantilla: ${response.statusText}`);
                    return response.text();
                })
                .then((html) => new DOMParser().parseFromString(html, 'text/html')
                    .querySelector('[popup-plantilla]'));
        }
        return PopUp._template;
    }

    async #render() {
        if (!this._renderPromise) {
            this._renderPromise = this._getTemplate().then((template) => {
                this.shadowRoot.appendChild(template.content.cloneNode(true));
                this.#dialog = this.shadowRoot.querySelector('.popup');
                this.#titulo = this.shadowRoot.querySelector('.popup__titulo');
                this.#descripcion = this.shadowRoot.querySelector('.popup__descripcion');
                this.#cerrar = this.shadowRoot.querySelector('.popup__cerrar');
                this.#aceptar = this.shadowRoot.querySelector('.popup__aceptar');
                this.#cancelar = this.shadowRoot.querySelector('.popup__cancelar');
                this.#acciones = this.shadowRoot.querySelector('.popup__acciones');
                this.#cerrar.addEventListener('click', () => this.close('cerrar'));
                this.#aceptar.addEventListener('click', () => this.#confirmar());
                this.#cancelar.addEventListener('click', () => this.close('cancelar'));
            });
        }
        await this._renderPromise;
        this.#dialog.dataset.tipo = this.getAttribute('tipo') || 'mensaje';
        this.#titulo.textContent = this.getAttribute('titulo') || '';
        this.#descripcion.textContent = this.getAttribute('descripcion') || '';
        this.#aceptar.textContent = this.getAttribute('texto-aceptar') || 'Aceptar';
        this.#cancelar.textContent = this.getAttribute('texto-cancelar') || 'Cancelar';
        this.#acciones.dataset.alineacion = this.getAttribute('alineacion') || 'derecha';
        this.#acciones.hidden = this.getAttribute('variante') === 'vacio';
    }

    show() { this.#render().then(() => this.#dialog.showModal()).catch((error) => console.error(error)); }
    close(motivo = 'cerrar') { if (this.#dialog?.open) this.#dialog.close(); this.dispatchEvent(new CustomEvent('cerrar-popup', { detail: { motivo }, bubbles: true, composed: true })); }
    #confirmar() { this.dispatchEvent(new CustomEvent('aceptar-popup', { bubbles: true, composed: true })); this.close('aceptar'); }
    get dialog() { return this.#dialog; }

    connectedCallback() { this.#render().catch((error) => console.error(error)); }
    attributeChangedCallback() { if (this.isConnected) this.#render().catch((error) => console.error(error)); }
}

customElements.define('app-popup', PopUp);
