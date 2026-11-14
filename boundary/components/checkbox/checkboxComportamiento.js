/**
 * Componente de casilla de verificación.
 *
 * @author Mil
 */

class CustomCheckbox extends HTMLElement {

    static observedAttributes = ['label', 'checked', 'value', 'disabled', 'required', 'name', 'indeterminate'];

    #input;
    #label;
    #labelText;
    #slot;
    #inicializado = false;

    constructor() {
        super();

        this.attachShadow({ mode: 'open' });

        const template = document.getElementById('custom-checkbox-template');
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this.#input = this.shadowRoot.querySelector('.custom-checkbox__input');
        this.#label = this.shadowRoot.querySelector('.custom-checkbox__label');
        this.#labelText = this.shadowRoot.querySelector('.custom-checkbox__label-text');
        this.#slot = this.shadowRoot.querySelector('slot');

        for (const tipo of ['input', 'change']) {
            this.#input.addEventListener(tipo, (evento) => {
                evento.stopPropagation();
                this.dispatchEvent(new Event(tipo, { bubbles: true, composed: true }));
            });
        }

        this.#slot.addEventListener('slotchange', () => this.#render());
    }

    connectedCallback() {
        if (!this.#inicializado) {
            this.#input.checked = this.hasAttribute('checked');
            this.#input.indeterminate = this.hasAttribute('indeterminate');
            this.#inicializado = true;
        }
        this.#render();
    }

    attributeChangedCallback(nombre, valorAnterior, valorNuevo) {
        if (valorAnterior === valorNuevo || !this.#input) return;

        if (nombre === 'checked') {
            this.#input.checked = valorNuevo !== null;
        } else if (nombre === 'indeterminate') {
            this.#input.indeterminate = valorNuevo !== null;
        }
        this.#render();
    }

    get checked() {
        return this.#input.checked;
    }

    set checked(valor) {
        this.#input.checked = Boolean(valor);
    }

    get value() {
        return this.#input.value;
    }

    set value(valor) {
        this.setAttribute('value', valor == null ? '' : String(valor));
    }

    get indeterminate() {
        return this.#input.indeterminate;
    }

    set indeterminate(valor) {
        this.#input.indeterminate = Boolean(valor);
    }

    #tieneContenidoEnSlot() {
        return this.#slot.assignedNodes({ flatten: true }).some((nodo) =>
            nodo.nodeType === 1 || nodo.textContent.trim().length > 0
        );
    }

    #render() {
        this.#input.disabled = this.hasAttribute('disabled');
        this.#input.required = this.hasAttribute('required');
        this.#input.name = this.getAttribute('name') ?? '';
        this.#input.value = this.getAttribute('value') ?? 'on';

        const texto = this.getAttribute('label') ?? '';
        const mostrarLabel = Boolean(texto) || this.#tieneContenidoEnSlot();
        this.#labelText.textContent = texto;
        this.#label.hidden = !mostrarLabel;
        this.#input.setAttribute('aria-label', texto || (mostrarLabel ? 'Opción' : 'Seleccionar'));
    }
}

customElements.define('custom-checkbox', CustomCheckbox);