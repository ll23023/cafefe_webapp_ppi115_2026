/**
 * Botón redondeado con variantes visuales.
 *
 * @author Mil
 */

class CustomBotonRedondeado extends HTMLElement {
    static observedAttributes = ['texto', 'tipo', 'disabled'];
    static _template;

    _isRendered = false;
    _renderPromise;
    #button;
    #texto;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    async _getTemplate() {
        if (!CustomBotonRedondeado._template) {
            CustomBotonRedondeado._template = fetch('/js/boundary/components/botonRedondeado/botonRedondeadoPlantilla.html')
                .then((response) => {
                    if (!response.ok) throw new Error(`Error al cargar la plantilla: ${response.statusText}`);
                    return response.text();
                })
                .then((html) => {
                    const template = new DOMParser().parseFromString(html, 'text/html')
                        .querySelector('[boton-redondeado-plantilla]');
                    if (!template) throw new Error('No se encontró la plantilla de botón redondeado.');
                    return template;
                });
        }
        return CustomBotonRedondeado._template;
    }

    async _renderElement() {
        if (!this._renderPromise) {
            this._renderPromise = this._getTemplate().then((template) => {
                this.shadowRoot.appendChild(template.content.cloneNode(true));
                this.#button = this.shadowRoot.querySelector('.boton-redondeado');
                this.#texto = this.shadowRoot.querySelector('.boton-redondeado__texto');
                this.#button.addEventListener('click', (evento) => {
                    evento.stopPropagation();
                    this.dispatchEvent(new MouseEvent('click', {
                        bubbles: true,
                        composed: true,
                        cancelable: true,
                        detail: evento.detail
                    }));
                });
                this._isRendered = true;
            });
        }
        await this._renderPromise;
        this.#adoptarPropiedades();
        this.#render();
    }

    connectedCallback() {
        this._renderElement().catch((error) => console.error(error));
    }

    attributeChangedCallback() {
        if (this.isConnected && this._isRendered) {
            this._renderElement().catch((error) => console.error(error));
        }
    }

    get texto() {
        return this.getAttribute('texto') ?? '';
    }

    set texto(valor) {
        this.setAttribute('texto', valor == null ? '' : String(valor));
    }

    get disabled() {
        return this.#button?.disabled ?? this.hasAttribute('disabled');
    }

    set disabled(valor) {
        this.toggleAttribute('disabled', Boolean(valor));
    }

    click() {
        if (this.#button) {
            this.#button.click();
        } else {
            this._renderElement()
                .then(() => this.#button.click())
                .catch((error) => console.error(error));
        }
    }

    #adoptarPropiedades() {
        for (const propiedad of ['texto', 'disabled']) {
            if (Object.hasOwn(this, propiedad)) {
                const valor = this[propiedad];
                delete this[propiedad];
                this[propiedad] = valor;
            }
        }
    }

    #render() {
        this.#texto.textContent = this.texto;
        this.#texto.hidden = !this.texto;
        this.#button.disabled = this.hasAttribute('disabled');
    }
}

customElements.define('custom-boton-redondeado', CustomBotonRedondeado);