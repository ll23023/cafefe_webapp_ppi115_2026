/**
 * Botón circular con contenido personalizable.
 *
 * @author Mil
 */

class CustomBotonCircular extends HTMLElement {
    
    static observedAttributes = ['disabled', 'aria-label'];

    #button;

    constructor() {
        super();

        this.attachShadow({ mode: 'open' });

        const template = document.getElementById('custom-boton-circular-template');
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.#button = this.shadowRoot.querySelector('.boton-circular');

        this.#button.addEventListener('click', (evento) => {
            evento.stopPropagation();
            this.dispatchEvent(new MouseEvent('click', {
                bubbles: true,
                composed: true,
                cancelable: true,
                detail: evento.detail
            }));
        });
    }

    connectedCallback() {
        this.#adoptarPropiedades();
        this.#render();
    }

    attributeChangedCallback() {
        if (this.#button) this.#render();
    }

    get disabled() {
        return this.#button.disabled;
    }

    set disabled(valor) {
        this.toggleAttribute('disabled', Boolean(valor));
    }

    click() {
        this.#button.click();
    }

    #adoptarPropiedades() {
        if (Object.hasOwn(this, 'disabled')) {
            const deshabilitado = this.disabled;
            delete this.disabled;
            this.disabled = deshabilitado;
        }
    }

    #render() {
        this.#button.disabled = this.hasAttribute('disabled');
        this.#button.setAttribute('aria-label', this.getAttribute('aria-label') || 'Agregar');
    }
}

customElements.define('custom-boton-circular', CustomBotonCircular);