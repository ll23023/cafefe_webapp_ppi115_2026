/**
 * Control para cambiar el estado de un item o una lista.
 *
 * @author MikeLB
 */
class CambioEstado extends HTMLElement {
    static observedAttributes = ['estado', 'modo', 'disabled'];
    static _template;

    _isRendered = false;
    _renderPromise;
    _checkbox;
    _texto;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    _getTemplate() {
        if (!CambioEstado._template) {
            CambioEstado._template = fetch('./js/boundary/components/cambioEstado/cambioEstadoPlantilla.html')
                .then((response) => {
                    if (!response.ok) throw new Error(`Error al cargar la plantilla: ${response.statusText}`);
                    return response.text();
                })
                .then((html) => new DOMParser().parseFromString(html, 'text/html')
                    .querySelector('[cambio-estado-plantilla]'));
        }
        return CambioEstado._template;
    }

    _renderElement() {
        if (!this._renderPromise) {
            this._renderPromise = this._getTemplate().then((template) => {
                this.shadowRoot.appendChild(template.content.cloneNode(true));
                this._checkbox = this.shadowRoot.querySelector('.cambio-estado__checkbox');
                this._texto = this.shadowRoot.querySelector('.cambio-estado__texto');
                this._checkbox.addEventListener('change', (evento) => this._cambiarEstado(evento));
                this._isRendered = true;
            });
        }
        return this._renderPromise.then(() => {
        const estado = this.getAttribute('estado') || 'pendiente';
        this._checkbox.checked = ['listo', 'activo'].includes(estado);
        this._texto.textContent = this._checkbox.checked ? 'Listo' : 'Pendiente';
        this._texto.dataset.estado = this._checkbox.checked ? 'listo' : 'pendiente';
        this._checkbox.disabled = this.hasAttribute('disabled') ||
            (this.getAttribute('modo') || 'toggle') === 'oneChange' && this._checkbox.checked;
        });
    }

    _cambiarEstado(evento) {
        const modo = this.getAttribute('modo') || 'toggle';
        const nuevoEstado = evento.target.checked ? 'listo' : 'pendiente';
        this.setAttribute('estado', nuevoEstado);
        this._texto.textContent = nuevoEstado === 'listo' ? 'Listo' : 'Pendiente';
        this._texto.dataset.estado = nuevoEstado;
        if (modo === 'oneChange') this._checkbox.disabled = true;
        this.dispatchEvent(new CustomEvent('cambio-estado', {
            detail: { estado: nuevoEstado, modo },
            bubbles: true,
            composed: true
        }));
    }

    connectedCallback() {
        this._renderElement().catch((error) => console.error(error));
    }

    attributeChangedCallback(nombre, valorAnterior, valorNuevo) {
        if (valorAnterior !== valorNuevo && this.isConnected) this._renderElement();
    }
}

customElements.define('cambio-estado', CambioEstado);
