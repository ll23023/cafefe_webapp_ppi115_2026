/**
 * Carrusel horizontal de filtros circulares.
 *
 * @author MikeLB
 */
class CarruselFiltros extends HTMLElement {
    static observedAttributes = ['filtros'];
    static _template;

    _isRendered = false;
    _renderPromise;
    _filtros;
    _anterior;
    _siguiente;
    _actualizarOverflow;
    _observadorTamano;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    _getTemplate() {
        if (!CarruselFiltros._template) {
            CarruselFiltros._template = fetch('./js/boundary/components/carruselFiltros/carruselFiltrosPlantilla.html')
                .then((response) => {
                    if (!response.ok) throw new Error(`Error al cargar la plantilla: ${response.statusText}`);
                    return response.text();
                })
                .then((html) => new DOMParser().parseFromString(html, 'text/html')
                    .querySelector('[carrusel-filtros-plantilla]'));
        }
        return CarruselFiltros._template;
    }

    _renderElement() {
        if (!this._renderPromise) {
            this._renderPromise = this._getTemplate().then((template) => {
                this.shadowRoot.appendChild(template.content.cloneNode(true));
                this._filtros = this.shadowRoot.querySelector('.carrusel-filtros__lista');
                this._anterior = this.shadowRoot.querySelector('.carrusel-filtros__boton--anterior');
                this._siguiente = this.shadowRoot.querySelector('.carrusel-filtros__boton--siguiente');
                this._anterior.addEventListener('click', () => this._desplazar(-1));
                this._siguiente.addEventListener('click', () => this._desplazar(1));
                this._actualizarOverflow = () => this._actualizarBotones();
                this._filtros.addEventListener('scroll', this._actualizarOverflow, { passive: true });
                this._filtros.addEventListener('filtro-seleccionado', (event) => {
                    if (!event.detail?.activo) return;
                    this._filtros.querySelectorAll('filtro-circular').forEach((filtro) => {
                        if (filtro !== event.target) filtro.deseleccionar();
                    });
                });
                if (typeof ResizeObserver === 'function') {
                    this._observadorTamano = new ResizeObserver(this._actualizarOverflow);
                }
                this._isRendered = true;
            });
        }
        return this._renderPromise.then(() => {
        this._renderFiltros();
        this._actualizarBotones();
        });
    }

    _renderFiltros() {
        let filtros = [];
        try {
            filtros = JSON.parse(this.getAttribute('filtros') || '[]');
            if (!Array.isArray(filtros)) {
                throw new TypeError('Los filtros del carrusel deben ser un arreglo.');
            }
        } catch (error) {
            console.error('No se pudieron interpretar las categorías del carrusel:', error);
            this.dispatchEvent(new CustomEvent('error-carrusel', { detail: error, bubbles: true, composed: true }));
            filtros = [];
        }

        this._observadorTamano?.disconnect();
        this._observadorTamano?.observe(this._filtros);
        this._filtros.replaceChildren();
        for (const filtro of Array.isArray(filtros) ? filtros : []) {
            const elemento = document.createElement('filtro-circular');
            const id = filtro && typeof filtro === 'object'
                ? filtro.uid ?? filtro.idTipoProducto ?? filtro.filtroId ?? filtro.id ?? ''
                : filtro;
            if (id) {
                elemento.setAttribute('filtroId', id);
                elemento.setAttribute('nombre', typeof filtro === 'object' ? filtro.nombre ?? String(id) : String(id));
            }
            this._filtros.appendChild(elemento);
            this._observadorTamano?.observe(elemento);
        }
    }

    _desplazar(direccion) {
        const distancia = this._filtros.clientWidth || 200;
        this._filtros.scrollBy({ left: direccion * distancia, behavior: 'smooth' });
        this._actualizarBotones();
    }

    _actualizarBotones() {
        if (!this._isRendered) return;
        const hayOverflow = this._filtros.scrollWidth > this._filtros.clientWidth;
        this._filtros.classList.toggle('carrusel-filtros__lista--desbordado', hayOverflow);
        this._anterior.disabled = !hayOverflow || this._filtros.scrollLeft <= 0;
        this._siguiente.disabled = !hayOverflow ||
            this._filtros.scrollLeft + this._filtros.clientWidth >= this._filtros.scrollWidth - 1;
    }

    connectedCallback() {
        this._renderElement().catch((error) => console.error(error));
    }

    attributeChangedCallback(nombre, valorAnterior, valorNuevo) {
        if (valorAnterior !== valorNuevo && this.isConnected) {
            this._renderElement().catch((error) => console.error(error));
        }
    }

    disconnectedCallback() {
        this._observadorTamano?.disconnect();
    }
}

customElements.define('carrusel-filtros', CarruselFiltros);
