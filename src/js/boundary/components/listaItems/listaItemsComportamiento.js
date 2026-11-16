/**
 * Lista de items configurada mediante un JSON.
 *
 * @author MikeLB
 */
class ListaItems extends HTMLElement {
    static observedAttributes = ['items', 'tipo'];
    static _template;

    _isRendered = false;
    _renderPromise;
    _lista;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    async _getTemplate() {
        if (!ListaItems._template) {
            ListaItems._template = fetch('./js/boundary/components/listaItems/listaItemsPlantilla.html')
                .then((response) => {
                    if (!response.ok) throw new Error(`Error al cargar la plantilla: ${response.statusText}`);
                    return response.text();
                })
                .then((html) => new DOMParser().parseFromString(html, 'text/html')
                    .querySelector('[lista-items-plantilla]'));
        }
        return ListaItems._template;
    }

    async _renderElement() {
        if (!this._renderPromise) {
            this._renderPromise = this._getTemplate().then((template) => {
                this.shadowRoot.appendChild(template.content.cloneNode(true));
                this._lista = this.shadowRoot.querySelector('.lista-items');
                this._isRendered = true;
            });
        }
        await this._renderPromise;

        let items = [];
        try {
            items = JSON.parse(this.getAttribute('items') || '[]');
        } catch (error) {
            this.dispatchEvent(new CustomEvent('error-lista', { detail: error, bubbles: true, composed: true }));
        }
        this._lista.replaceChildren();
        for (const item of Array.isArray(items) ? items : []) {
            const elemento = document.createElement(this.getAttribute('tipo') === 'carrito' ? 'item-carrito' : 'lista-item');
            for (const atributo of this.getAttribute('tipo') === 'carrito'
                ? ['id', 'titulo', 'descripcion', 'precio', 'imagen', 'cantidad']
                : ['titulo', 'descripcion', 'precio', 'imagen']) {
                if (item?.[atributo] != null) elemento.setAttribute(atributo, item[atributo]);
            }
            this._lista.appendChild(elemento);
        }
    }

    connectedCallback() {
        this._renderElement().catch((error) => console.error(error));
    }

    attributeChangedCallback(nombre, valorAnterior, valorNuevo) {
        if (valorAnterior !== valorNuevo && this.isConnected) this._renderElement();
    }
}

customElements.define('lista-items', ListaItems);
