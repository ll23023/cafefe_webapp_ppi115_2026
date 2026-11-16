/**
 * Item rectangular reutilizable para listas.
 *
 * @author MikeLB
 */
class Item extends HTMLElement {
    static observedAttributes = ['titulo', 'descripcion', 'precio', 'imagen'];
    static _template;

    _isRendered = false;
    _renderPromise;
    _titulo;
    _descripcion;
    _precio;
    _imagen;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    async _getTemplate() {
        if (!Item._template) {
            Item._template = fetch('./js/boundary/components/item/itemPlantilla.html')
                .then((response) => {
                    if (!response.ok) throw new Error(`Error al cargar la plantilla: ${response.statusText}`);
                    return response.text();
                })
                .then((html) => new DOMParser().parseFromString(html, 'text/html')
                    .querySelector('[item-plantilla]'));
        }
        return Item._template;
    }

    async _renderElement() {
        if (!this._renderPromise) {
            this._renderPromise = this._getTemplate().then((template) => {
                this.shadowRoot.appendChild(template.content.cloneNode(true));
                this._titulo = this.shadowRoot.querySelector('.item__titulo');
                this._descripcion = this.shadowRoot.querySelector('.item__descripcion');
                this._precio = this.shadowRoot.querySelector('.item__precio');
                this._imagen = this.shadowRoot.querySelector('.item__imagen');
                this._isRendered = true;
            });
        }
        await this._renderPromise;
        this._titulo.textContent = this.getAttribute('titulo') || '';
        this._descripcion.textContent = this.getAttribute('descripcion') || '';
        this._precio.textContent = this.getAttribute('precio') || '';
        this._imagen.src = this.getAttribute('imagen') || '';
        this._imagen.alt = this.getAttribute('titulo') || '';
    }

    connectedCallback() {
        this._renderElement().catch((error) => console.error(error));
    }

    attributeChangedCallback(nombre, valorAnterior, valorNuevo) {
        if (valorAnterior !== valorNuevo && this._isRendered) this._renderElement();
    }
}

customElements.define('lista-item', Item);
