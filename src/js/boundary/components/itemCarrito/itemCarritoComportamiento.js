/**
 * Variante de Item para productos del carrito.
 *
 * @author MikeLB
 */
class ItemCarrito extends HTMLElement {
    static observedAttributes = ['titulo', 'descripcion', 'precio', 'imagen', 'cantidad'];
    static _template;
    _renderPromise;
    #imagen;
    #titulo;
    #descripcion;
    #precio;
    #cantidad;
    #eliminar;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    async _getTemplate() {
        if (!ItemCarrito._template) {
            ItemCarrito._template = fetch('./js/boundary/components/itemCarrito/itemCarritoPlantilla.html')
                .then((response) => {
                    if (!response.ok) throw new Error(`Error al cargar la plantilla: ${response.statusText}`);
                    return response.text();
                })
                .then((html) => new DOMParser().parseFromString(html, 'text/html')
                    .querySelector('[item-carrito-plantilla]'));
        }
        return ItemCarrito._template;
    }

    async #render() {
        if (!this._renderPromise) {
            this._renderPromise = this._getTemplate().then((template) => {
                this.shadowRoot.appendChild(template.content.cloneNode(true));
                this.#imagen = this.shadowRoot.querySelector('.item-carrito__imagen');
                this.#titulo = this.shadowRoot.querySelector('.item-carrito__titulo');
                this.#descripcion = this.shadowRoot.querySelector('.item-carrito__descripcion');
                this.#precio = this.shadowRoot.querySelector('.item-carrito__precio');
                this.#cantidad = this.shadowRoot.querySelector('spinner-numerico');
                this.#eliminar = this.shadowRoot.querySelector('custom-boton-circular');
                this.#cantidad.addEventListener('change', () => this.setAttribute('cantidad', this.#cantidad.value));
                this.#eliminar.addEventListener('click', () => this.dispatchEvent(new CustomEvent('eliminar-item', { detail: { id: this.getAttribute('id') }, bubbles: true, composed: true })));
            });
        }
        await this._renderPromise;
        this.#imagen.src = this.getAttribute('imagen') || '';
        this.#imagen.alt = this.getAttribute('titulo') || '';
        this.#titulo.textContent = this.getAttribute('titulo') || '';
        this.#descripcion.textContent = this.getAttribute('descripcion') || '';
        this.#precio.textContent = this.getAttribute('precio') || '';
        this.#cantidad.setAttribute('value', this.getAttribute('cantidad') || '1');
    }

    connectedCallback() { this.#render().catch((error) => console.error(error)); }
    attributeChangedCallback() { if (this.isConnected) this.#render().catch((error) => console.error(error)); }
}

customElements.define('item-carrito', ItemCarrito);
