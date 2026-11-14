/**
 * Botón flotante de acceso al carrito.
 *
 * @author Mil
 */

class CustomBotonFlotante extends HTMLElement {
  
    static observedAttributes = ['texto', 'disabled', 'aria-label'];

    #button;
    #texto;

    constructor() {
        super();

        this.attachShadow({ mode: 'open' });

        const template = document.getElementById('custom-boton-flotante-template');
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.#button = this.shadowRoot.querySelector('.boton-flotante');
        this.#texto = this.shadowRoot.querySelector('.boton-flotante__texto');

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

    get texto() {
        return this.getAttribute('texto') ?? '';
    }

    set texto(valor) {
        this.setAttribute('texto', valor == null ? '' : String(valor));
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
        if (this.hasAttribute('aria-label')) {
            this.#button.setAttribute('aria-label', this.getAttribute('aria-label'));
        } else {
            this.#button.removeAttribute('aria-label');
        }
    }
}

customElements.define('custom-boton-flotante', CustomBotonFlotante);