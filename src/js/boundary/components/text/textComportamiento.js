/**
 * Componente para crear un campo de texto. 
 *
 * @author Mil
 */

class CustomText extends HTMLElement {
    static observedAttributes = [
        'label',
        'value',
        'type',
        'helper',
        'error',
        'hide-label',
        'disabled',
        'required',
        'name',
        'placeholder'
    ];

    static #contador = 0;
    static _template;

    _isRendered = false;
    _renderPromise;
    #container;
    #label;
    #labelText;
    #input;
    #message;
    #messageText;
    #inicializado = false;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    _getTemplate() {
        if (!CustomText._template) {
            CustomText._template = fetch('./js/boundary/components/text/textPlantilla.html')
                .then((response) => {
                    if (!response.ok) throw new Error(`Error al cargar la plantilla: ${response.statusText}`);
                    return response.text();
                })
                .then((html) => {
                    const template = new DOMParser().parseFromString(html, 'text/html')
                        .querySelector('[text-plantilla]');
                    if (!template) throw new Error('No se encontró la plantilla de text.');
                    return template;
                });
        }
        return CustomText._template;
    }

    _renderElement() {
        if (!this._renderPromise) {
            this._renderPromise = this._getTemplate().then((template) => {
                this.shadowRoot.appendChild(template.content.cloneNode(true));
                this.#container = this.shadowRoot.querySelector('.custom-text');
                this.#label = this.shadowRoot.querySelector('.custom-text__label');
                this.#labelText = this.shadowRoot.querySelector('.custom-text__label-text');
                this.#input = this.shadowRoot.querySelector('.custom-text__input');
                this.#message = this.shadowRoot.querySelector('.custom-text__message');
                this.#messageText = this.shadowRoot.querySelector('.custom-text__message-text');

                const inputId = `custom-text-${++CustomText.#contador}`;
                this.#input.id = inputId;
                this.#label.htmlFor = inputId;
                this.#input.addEventListener('input', () => {
                    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
                });
                this.#input.addEventListener('change', () => {
                    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
                });
                this.shadowRoot.querySelectorAll('slot').forEach((slot) => {
                    slot.addEventListener('slotchange', () => {
                        this._renderElement().catch((error) => console.error(error));
                    });
                });
                this._isRendered = true;
            });
        }
        return this._renderPromise.then(() => {
        if (!this.#inicializado) {
            const valorInicial = this.getAttribute('value');
            if (valorInicial !== null) this.#input.value = valorInicial;
            this.#inicializado = true;
        }
        this.#render();
        });
    }

    connectedCallback() {
        this._renderElement().catch((error) => console.error(error));
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue || !this.isConnected || !this._isRendered) return;

        if (name === 'value') {
            this.#input.value = newValue ?? '';
        }

        this._renderElement().catch((error) => console.error(error));
    }

    get value() {
        return this.#input?.value ?? this.getAttribute('value') ?? '';
    }

    set value(val) {
        const texto = val ?? '';
        if (this.#input) {
            this.#input.value = texto;
        }
        this.setAttribute('value', texto);
    }

    #tieneSlotAsignado(nombreSlot) {
        const slot = this.shadowRoot.querySelector(`slot[name="${nombreSlot}"]`);
        return slot ? slot.assignedNodes({ flatten: true }).length > 0 : false;
    }

    #render() {
        const label = this.getAttribute('label') ?? '';
        const type = this.getAttribute('type') ?? 'text';
        const error = this.getAttribute('error') ?? '';
        const helper = this.getAttribute('helper') ?? '';
        const disabled = this.hasAttribute('disabled');
        const required = this.hasAttribute('required');
        const name = this.getAttribute('name') ?? '';

        // Label (mediante atributo 'label' o proyectado con slot="label")
        this.#labelText.textContent = label;
        this.#label.hidden = this.hasAttribute('hide-label');

        // Atributos del input interno
        this.#input.type = type;
        this.#input.disabled = disabled;
        this.#input.required = required;
        if (name) {
            this.#input.name = name;
        }

        // Mensaje inferior (prioriza error sobre helper, o contenido en slot="message")
        const textoMensaje = error || helper;
        this.#messageText.textContent = textoMensaje;
        const mostrarMensaje = Boolean(textoMensaje) || this.#tieneSlotAsignado('message');
        this.#message.hidden = !mostrarMensaje;

        // Modificadores BEM y accesibilidad
        const hayError = Boolean(error);
        this.#container.classList.toggle('custom-text--error', hayError);
        this.#container.classList.toggle('custom-text--disabled', disabled);
        this.#input.setAttribute('aria-invalid', String(hayError));

        // Placeholder (mensaje fantasma) que se puede usar a conveniencia
        this.#input.placeholder = this.getAttribute('placeholder') ?? '';
    }
}

customElements.define('custom-text', CustomText);