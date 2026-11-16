/**
 * Rejilla de tarjetas configurada mediante JSON.
 *
 * @author MikeLB
 */
class RejillaTarjetas extends HTMLElement {
    static observedAttributes = ['registros'];
    #rejilla;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = '<link rel="stylesheet" href="./js/boundary/components/rejillaTarjetas/rejillaTarjetasEstilo.css"><section class="rejilla-tarjetas" aria-label="Productos"></section>';
        this.#rejilla = this.shadowRoot.querySelector('.rejilla-tarjetas');
    }

    connectedCallback() { this.#render(); }
    attributeChangedCallback() { if (this.#rejilla) this.#render(); }

    #render() {
        let registros = [];
        try { registros = JSON.parse(this.getAttribute('registros') || '[]'); }
        catch (error) { this.dispatchEvent(new CustomEvent('error-rejilla', { detail: error, bubbles: true, composed: true })); }
        this.#rejilla.replaceChildren();
        for (const registro of Array.isArray(registros) ? registros : []) {
            const tarjeta = document.createElement('custom-tarjeta');
            for (const atributo of ['uid', 'titulo', 'descripcion', 'precio', 'variante']) {
                if (registro?.[atributo] != null) tarjeta.setAttribute(atributo, registro[atributo]);
            }
            this.#rejilla.appendChild(tarjeta);
        }
    }
}

customElements.define('rejilla-tarjetas', RejillaTarjetas);
