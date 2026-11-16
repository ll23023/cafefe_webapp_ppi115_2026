/**
 * Panel navegable para una aplicación de una sola página.
 *
 * @author MikeLB
 */
class Panel extends HTMLElement {
    static observedAttributes = ['nombre', 'activo'];
    #titulo;
    #contenido;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = '<link rel="stylesheet" href="./js/boundary/components/panel/panelEstilo.css"><section class="panel"><h2 class="panel__titulo"></h2><div class="panel__contenido"><slot></slot></div></section>';
        this.#titulo = this.shadowRoot.querySelector('.panel__titulo');
        this.#contenido = this.shadowRoot.querySelector('.panel__contenido');
    }

    connectedCallback() { this.#render(); }
    attributeChangedCallback() { if (this.#titulo) this.#render(); }

    #render() {
        this.#titulo.textContent = this.getAttribute('nombre') || '';
        this.hidden = this.hasAttribute('activo') && this.getAttribute('activo') === 'false';
    }
}

customElements.define('app-panel', Panel);
