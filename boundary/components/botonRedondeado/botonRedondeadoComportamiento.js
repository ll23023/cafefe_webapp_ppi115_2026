/**
 * Botón redondeado con variantes visuales.
 *
 * @author Mil
 */

class CustomBotonRedondeado extends HTMLElement {
    
    static observedAttributes = ['texto', 'tipo', 'disabled'];

    #button;
    #texto;

    constructor() {
        super();

        this.attachShadow({ mode: 'open' });

        const template = document.getElementById('custom-boton-redondeado-template');
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
    }
}

customElements.define('custom-boton-redondeado', CustomBotonRedondeado);