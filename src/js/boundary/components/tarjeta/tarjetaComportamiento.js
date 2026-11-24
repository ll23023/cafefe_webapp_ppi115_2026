/**
 * Tarjeta de producto con imagen local y contenido configurable.
 *
 * @author Mil
 */

class CustomTarjeta extends HTMLElement {

    static observedAttributes = ['titulo', 'descripcion', 'precio', 'variante', 'disabled', 'uid'];
    static _template;

    _isRendered = false;
    _renderPromise;
    #titulo;
    #descripcion;
    #precio;
    #imagen;
    #boton;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    _getTemplate() {
        if (!CustomTarjeta._template) {
            CustomTarjeta._template = fetch('./js/boundary/components/tarjeta/tarjetaPlantilla.html')
                .then((response) => {
                    if (!response.ok) throw new Error(`Error al cargar la plantilla: ${response.statusText}`);
                    return response.text();
                })
                .then((html) => {
                    const template = new DOMParser().parseFromString(html, 'text/html')
                        .querySelector('[tarjeta-plantilla]');
                    if (!template) throw new Error('No se encontró la plantilla de tarjeta.');
                    return template;
                });
        }
        return CustomTarjeta._template;
    }

    _renderElement() {
        if (!this._renderPromise) {
            this._renderPromise = this._getTemplate().then((template) => {
                this.shadowRoot.appendChild(template.content.cloneNode(true));
                this.#titulo = this.shadowRoot.querySelector('.tarjeta__titulo');
                this.#descripcion = this.shadowRoot.querySelector('.tarjeta__descripcion');
                this.#precio = this.shadowRoot.querySelector('.tarjeta__precio');
                this.#imagen = this.shadowRoot.querySelector('.tarjeta__imagen');
                this.#boton = this.shadowRoot.querySelector('.tarjeta__agregar');
                this.#boton.addEventListener('click', () => {
                    this.dispatchEvent(new CustomEvent('tarjeta-agregar', {
                        bubbles: true,
                        composed: true,
                        detail: {
                            uid: this.getAttribute('uid') ?? '',
                            titulo: this.getAttribute('titulo') ?? '',
                            precio: this.getAttribute('precio') ?? ''
                        }
                    }));
                });
                this._isRendered = true;
            });
        }
        return this._renderPromise.then(() => {
        this.#render();
        });
    }

    connectedCallback() {
        this._renderElement().catch((error) => console.error(error));
    }

    attributeChangedCallback(nombre, valorAnterior, valorNuevo) {
        if (valorAnterior !== valorNuevo && this.isConnected && this._isRendered) {
            this._renderElement().catch((error) => console.error(error));
        }
    }

    #render() {
        this.#titulo.textContent = this.getAttribute('titulo') ?? '';
        this.#descripcion.textContent = this.getAttribute('descripcion') ?? '';
        this.#precio.textContent = this.getAttribute('precio') ?? '';
        this.#boton.disabled = this.hasAttribute('disabled');

        const uid = this.getAttribute('uid') ?? '';
        const imagenPorDefecto = './assets/images/categorias/test.png';
        this.#imagen.onerror = function() {
            this.onerror = null;
            this.src = imagenPorDefecto;
        };
        this.#imagen.src = uid
            ? `./assets/images/${encodeURIComponent(uid)}.png`
            : imagenPorDefecto;
        this.#imagen.alt = this.getAttribute('titulo') ?? '';
    }
}

customElements.define('custom-tarjeta', CustomTarjeta);