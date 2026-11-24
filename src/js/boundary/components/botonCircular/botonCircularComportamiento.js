/**
 * Botón circular personalizable con icono, texto y color.
 *
 * @author Mil
 */

class CustomBotonCircular extends HTMLElement {
    static observedAttributes = ['disabled', 'aria-label', 'icono', 'texto', 'color'];
    static _template;

    _isRendered = false;
    _renderPromise;
    #button;
    #barras;
    #icono;
    #texto;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    _getTemplate() {
        if (!CustomBotonCircular._template) {
            CustomBotonCircular._template = fetch('./js/boundary/components/botonCircular/botonCircularPlantilla.html')
                .then((response) => {
                    if (!response.ok) throw new Error(`Error al cargar la plantilla: ${response.statusText}`);
                    return response.text();
                })
                .then((html) => {
                    const template = new DOMParser().parseFromString(html, 'text/html')
                        .querySelector('[boton-circular-plantilla]');
                    if (!template) throw new Error('No se encontró la plantilla de botón circular.');
                    return template;
                });
        }
        return CustomBotonCircular._template;
    }

    _renderElement() {
        if (!this._renderPromise) {
            this._renderPromise = this._getTemplate().then((template) => {
                this.shadowRoot.appendChild(template.content.cloneNode(true));
                this.#button = this.shadowRoot.querySelector('.boton-circular');
                this.#barras = this.shadowRoot.querySelectorAll('.boton-circular__barra');
                this.#icono = this.shadowRoot.querySelector('.boton-circular__icono');
                this.#texto = this.shadowRoot.querySelector('.boton-circular__texto');
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
        return this._renderPromise.then(() => {
        this.#adoptarPropiedades();
        this.#render();
        });
    }

    connectedCallback() {
        this._renderElement().catch((error) => console.error(error));
    }

    attributeChangedCallback() {
        if (this.isConnected && this._isRendered) {
            this._renderElement().catch((error) => console.error(error));
        }
    }

    get icono() {
        return this.getAttribute('icono') ?? '';
    }

    set icono(valor) {
        this.setAttribute('icono', valor == null ? '' : String(valor));
    }

    get texto() {
        return this.getAttribute('texto') ?? '';
    }

    set texto(valor) {
        this.setAttribute('texto', valor == null ? '' : String(valor));
    }

    get color() {
        return this.getAttribute('color') ?? '';
    }

    set color(valor) {
        if (valor == null) {
            this.removeAttribute('color');
        } else {
            this.setAttribute('color', String(valor));
        }
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
        for (const propiedad of ['icono', 'texto', 'color', 'disabled']) {
            if (Object.hasOwn(this, propiedad)) {
                const valor = this[propiedad];
                delete this[propiedad];
                this[propiedad] = valor;
            }
        }
    }

    #render() {
        const icono = this.icono.trim();
        const texto = this.texto;
        const mostrarIcono = Boolean(icono);
        const mostrarTexto = !mostrarIcono && Boolean(texto);

        this.#barras.forEach((barra) => {
            barra.hidden = mostrarIcono || mostrarTexto;
        });
        this.#icono.hidden = !mostrarIcono;
        if (mostrarIcono) {
            this.#icono.setAttribute('src', icono);
        } else {
            this.#icono.removeAttribute('src');
        }
        this.#texto.hidden = !mostrarTexto;
        this.#texto.textContent = mostrarTexto ? texto : '';

        this.#button.disabled = this.hasAttribute('disabled');
        this.#button.setAttribute('aria-label', this.getAttribute('aria-label') || 'Agregar');
        const color = this.color.trim();
        if (color) {
            this.#button.style.setProperty('--boton-circular-color', color);
        } else {
            this.#button.style.removeProperty('--boton-circular-color');
        }
    }
}

customElements.define('custom-boton-circular', CustomBotonCircular);