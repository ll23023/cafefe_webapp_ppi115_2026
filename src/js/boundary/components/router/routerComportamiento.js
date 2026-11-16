/**
 * Navegador de páginas que coordina los componentes CambioPagina.
 *
 * @author MikeLB
 */
class AppRouter extends HTMLElement {
    static observedAttributes = ['ruta'];
    #rutas;
    #actual;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = '<link rel="stylesheet" href="/js/boundary/components/router/routerEstilo.css"><nav class="router" aria-label="Navegación"><slot></slot></nav>';
        this.#rutas = this.shadowRoot.querySelector('.router');
        this.#rutas.addEventListener('cambiar-pagina', (evento) => this.navegar(evento.detail.ruta));
    }

    connectedCallback() { this.#render(); }
    attributeChangedCallback() { if (this.#rutas) this.#render(); }
    navegar(ruta) { this.setAttribute('ruta', ruta); window.location.hash = `#/${ruta.replace(/^\//, '')}`; this.dispatchEvent(new CustomEvent('navegar', { detail: { ruta }, bubbles: true, composed: true })); }
    #render() { for (const pagina of this.querySelectorAll('cambio-pagina')) pagina.toggleAttribute('seleccionado', pagina.getAttribute('ruta') === this.getAttribute('ruta')); }
}

customElements.define('app-router', AppRouter);
