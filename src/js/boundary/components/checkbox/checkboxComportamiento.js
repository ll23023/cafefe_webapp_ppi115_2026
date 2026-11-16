/**
 * Componente de casilla de verificación.
 *
 * @author Mil
 */

class CustomCheckbox extends HTMLElement {

    static observedAttributes = ['label', 'checked', 'value', 'disabled', 'required', 'name', 'indeterminate'];
    static _template;

    _isRendered = false;
    _renderPromise;
    #input;
    #label;
    #labelText;
    #slot;
    #inicializado = false;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    async _getTemplate() {
        if (!CustomCheckbox._template) {
            CustomCheckbox._template = fetch('/js/boundary/components/checkbox/checkboxPlantilla.html')
                .then((response) => {
                    if (!response.ok) throw new Error(`Error al cargar la plantilla: ${response.statusText}`);
                    return response.text();
                })
                .then((html) => {
                    const template = new DOMParser().parseFromString(html, 'text/html')
                        .querySelector('[checkbox-plantilla]');
                    if (!template) throw new Error('No se encontró la plantilla de checkbox.');
                    return template;
                });
        }
        return CustomCheckbox._template;
    }

    async _renderElement() {
        if (!this._renderPromise) {
            this._renderPromise = this._getTemplate().then((template) => {
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

                this.#slot.addEventListener('slotchange', () => {
                    this._renderElement().catch((error) => console.error(error));
                });
                this._isRendered = true;
            });
        }
        await this._renderPromise;
        if (!this.#inicializado) {
            this.#input.checked = this.hasAttribute('checked');
            this.#input.indeterminate = this.hasAttribute('indeterminate');
            this.#inicializado = true;
        }
        this.#render();
    }

    connectedCallback() {
        this._renderElement().catch((error) => console.error(error));
    }

    attributeChangedCallback(nombre, valorAnterior, valorNuevo) {
        if (valorAnterior === valorNuevo || !this.isConnected || !this._isRendered) return;

        if (nombre === 'checked') {
            this.#input.checked = valorNuevo !== null;
        } else if (nombre === 'indeterminate') {
            this.#input.indeterminate = valorNuevo !== null;
        }
        this.#render();
    }

    get checked() {
        return this.#input?.checked ?? this.hasAttribute('checked');
    }

    set checked(valor) {
        if (this.#input) this.#input.checked = Boolean(valor);
        else this.toggleAttribute('checked', Boolean(valor));
    }

    get value() {
        return this.#input?.value ?? this.getAttribute('value') ?? 'on';
    }

    set value(valor) {
        this.setAttribute('value', valor == null ? '' : String(valor));
    }

    get indeterminate() {
        return this.#input?.indeterminate ?? this.hasAttribute('indeterminate');
    }

    set indeterminate(valor) {
        if (this.#input) this.#input.indeterminate = Boolean(valor);
        else this.toggleAttribute('indeterminate', Boolean(valor));
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