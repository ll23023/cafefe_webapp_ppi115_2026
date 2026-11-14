/**
 * Componente de barra inferior con texto y acciones.
 *
 * @author Mil
 */

class CustomBarraInferior extends HTMLElement {

    static observedAttributes = ['texto', 'texto-secundario', 'texto-primario'];

    #texto;
    #secundario;
    #primario;

    constructor() {
        super();

        this.attachShadow({ mode: 'open' });

        const template = document.getElementById('custom-barra-inferior-template');
        this.shadowRoot.appendChild(document.importNode(template.content, true));

        this.#texto = this.shadowRoot.querySelector('.barra-inferior__texto');
        this.#secundario = this.shadowRoot.querySelector('.barra-inferior__boton--secundario');
        this.#primario = this.shadowRoot.querySelector('.barra-inferior__boton--primario');
    }

    connectedCallback() {
        this.#adoptarPropiedades();
        this.#render();
    }

    attributeChangedCallback(nombre, valorAnterior, valorNuevo) {
        if (valorAnterior === valorNuevo || !this.#texto) return;
        this.#render();
    }

    get botonSecundario() {
        return this.#secundario;
    }

    get botonPrimario() {
        return this.#primario;
    }

    get texto() {
        return this.getAttribute('texto') ?? '';
    }

    set texto(valor) {
        this.setAttribute('texto', valor == null ? '' : String(valor));
    }

    #adoptarPropiedades() {
        if (Object.hasOwn(this, 'texto')) {
            const texto = this.texto;
            delete this.texto;
            this.texto = texto;
        }
    }

    #render() {
        const texto = this.texto;
        this.#texto.textContent = texto;
        this.#texto.hidden = !texto;
        this.#secundario.setAttribute('texto', this.getAttribute('texto-secundario') ?? '');
        this.#primario.setAttribute('texto', this.getAttribute('texto-primario') ?? '');
    }
}

customElements.define('custom-barra-inferior', CustomBarraInferior);