/**
 * Tarjeta de producto con imagen local y contenido configurable.
 *
 * @author Mil
 */

class CustomTarjeta extends HTMLElement {

    static observedAttributes = ['titulo', 'descripcion', 'precio', 'variante', 'disabled'];

    #titulo;
    #descripcion;
    #precio;
    #boton;

    constructor() {
        super();

        this.attachShadow({ mode: 'open' });

        const template = document.getElementById('custom-tarjeta-template');
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this.#titulo = this.shadowRoot.querySelector('.tarjeta__titulo');
        this.#descripcion = this.shadowRoot.querySelector('.tarjeta__descripcion');
        this.#precio = this.shadowRoot.querySelector('.tarjeta__precio');
        this.#boton = this.shadowRoot.querySelector('.tarjeta__agregar');

        this.#boton.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('tarjeta-agregar', {
                bubbles: true,
                composed: true,
                detail: {
                    titulo: this.getAttribute('titulo') ?? '',
                    precio: this.getAttribute('precio') ?? ''
                }
            }));
        });
    }

    connectedCallback() {
        this.#render();
    }

    attributeChangedCallback(nombre, valorAnterior, valorNuevo) {
        if (valorAnterior !== valorNuevo && this.#boton) this.#render();
    }

    #render() {
        this.#titulo.textContent = this.getAttribute('titulo') ?? '';
        this.#descripcion.textContent = this.getAttribute('descripcion') ?? '';
        this.#precio.textContent = this.getAttribute('precio') ?? '';
        this.#boton.disabled = this.hasAttribute('disabled');
    }
}

customElements.define('custom-tarjeta', CustomTarjeta);