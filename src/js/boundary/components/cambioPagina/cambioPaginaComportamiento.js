/**
 * Enlace de navegación para cambiar el panel visible.
 *
 * @author MikeLB
 */
class CambioPagina extends HTMLElement {
    static observedAttributes = ['ruta', 'titulo', 'seleccionado'];
    #enlace;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = '<link rel="stylesheet" href="./js/boundary/components/cambioPagina/cambioPaginaEstilo.css"><a class="cambio-pagina" href="#"></a>';
        this.#enlace = this.shadowRoot.querySelector('.cambio-pagina');
        this.#enlace.addEventListener('click', (evento) => { evento.preventDefault(); this.dispatchEvent(new CustomEvent('cambiar-pagina', { detail: { ruta: this.getAttribute('ruta') || '' }, bubbles: true, composed: true })); });
    }

    connectedCallback() { this.#render(); }
    attributeChangedCallback() { if (this.#enlace) this.#render(); }
    #render() { this.#enlace.textContent = this.getAttribute('titulo') || this.getAttribute('ruta') || ''; this.#enlace.href = `#${this.getAttribute('ruta') || ''}`; this.#enlace.setAttribute('aria-current', this.hasAttribute('seleccionado') ? 'page' : 'false'); }
}

customElements.define('cambio-pagina', CambioPagina);
