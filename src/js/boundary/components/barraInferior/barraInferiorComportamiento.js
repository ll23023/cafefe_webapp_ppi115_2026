/**
 * Componente de barra inferior con texto y acciones.
 *
 * @author Mil
 */

class CustomBarraInferior extends HTMLElement {

    static observedAttributes = ['texto', 'texto-secundario', 'texto-primario'];
    static _template;

    _isRendered = false;
    _renderPromise;
    #texto;
    #secundario;
    #primario;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    async _getTemplate() {
        if (!CustomBarraInferior._template) {
            CustomBarraInferior._template = fetch('./js/boundary/components/barraInferior/barraInferiorPlantilla.html')
                .then((response) => {
                    if (!response.ok) throw new Error(`Error al cargar la plantilla: ${response.statusText}`);
                    return response.text();
                })
                .then((html) => {
                    const template = new DOMParser().parseFromString(html, 'text/html')
                        .querySelector('[barra-inferior-plantilla]');
                    if (!template) throw new Error('No se encontró la plantilla de barra inferior.');
                    return template;
                });
        }
        return CustomBarraInferior._template;
    }

    async _renderElement() {
        if (!this._renderPromise) {
            this._renderPromise = this._getTemplate().then((template) => {
                this.shadowRoot.appendChild(template.content.cloneNode(true));
                this.#texto = this.shadowRoot.querySelector('.barra-inferior__texto');
                this.#secundario = this.shadowRoot.querySelector('.barra-inferior__boton--secundario');
                this.#primario = this.shadowRoot.querySelector('.barra-inferior__boton--primario');
                this.#secundario.addEventListener('click', () => this.#emitirAccion('secundario'));
                this.#primario.addEventListener('click', () => this.#emitirAccion('primario'));
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
        this._renderElement().catch((error) => console.error(error));
    }

    get botonSecundario() {
        return this.#secundario;
    }

    get botonPrimario() {
        return this.#primario;
    }

    get texto() {
        return this.getAttribute('texto') ?? '';
    }

    set texto(valor) {
        this.setAttribute('texto', valor == null ? '' : String(valor));
    }

    #adoptarPropiedades() {
        if (Object.hasOwn(this, 'texto')) {
            const texto = this.texto;
            delete this.texto;
            this.texto = texto;
        }
    }

    #render() {
        const texto = this.texto;
        this.#texto.textContent = texto;
        this.#texto.hidden = !texto;
        this.#secundario.setAttribute('texto', this.getAttribute('texto-secundario') ?? '');
        this.#primario.setAttribute('texto', this.getAttribute('texto-primario') ?? '');
        this.#secundario.toggleAttribute('hidden', !this.getAttribute('texto-secundario'));
        this.#primario.toggleAttribute('hidden', !this.getAttribute('texto-primario'));
    }

    #emitirAccion(accion) {
        this.dispatchEvent(new CustomEvent('barra-accion', {
            detail: { accion },
            bubbles: true,
            composed: true
        }));
    }
}

customElements.define('custom-barra-inferior', CustomBarraInferior);