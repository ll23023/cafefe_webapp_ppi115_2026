/**
 * Componente para crear un campo de texto. 
 *
 * @author Mil
 */
class CustomText extends HTMLElement {
    static observedAttributes = [
        'label',
        'placeholder',
        'value',
        'type',
        'helper',
        'error',
        'disabled',
        'required',
        'name'
    ];

    static #contador = 0;

    #container;
    #label;
    #labelText;
    #input;
    #message;
    #messageText;

    constructor() {
        super();

        this.attachShadow({ mode: 'open' });

        // Se clona el contenido de la plantilla y se inserta en el espacio aislado.
        const template = document.getElementById('custom-text-template');
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        // Referencias internas dentro del shadowRoot
        this.#container = this.shadowRoot.querySelector('.custom-text');
        this.#label = this.shadowRoot.querySelector('.custom-text__label');
        this.#labelText = this.shadowRoot.querySelector('.custom-text__label-text');
        this.#input = this.shadowRoot.querySelector('.custom-text__input');
        this.#message = this.shadowRoot.querySelector('.custom-text__message');
        this.#messageText = this.shadowRoot.querySelector('.custom-text__message-text');

        // Vinculación accesible entre label e input dentro del Shadow DOM
        const inputId = `custom-text-${++CustomText.#contador}`;
        this.#input.id = inputId;
        this.#label.htmlFor = inputId;

        // Reenvío de eventos hacia el componente host (<custom-text>)
        this.#input.addEventListener('input', () => {
            this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
        });

        this.#input.addEventListener('change', () => {
            this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
        });

        // Re-renderizar si se insertan o quitan nodos en los slots
        this.shadowRoot.querySelectorAll('slot').forEach((slot) => {
            slot.addEventListener('slotchange', () => this.#render());
        });
    }

    connectedCallback() {
        const valorInicial = this.getAttribute('value');
        if (valorInicial !== null) {
            this.#input.value = valorInicial;
        }
        this.#render();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue || !this.#input) return;

        if (name === 'value') {
            this.#input.value = newValue ?? '';
        }

        this.#render();
    }

    get value() {
        return this.#input ? this.#input.value : (this.getAttribute('value') ?? '');
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
        const placeholder = this.getAttribute('placeholder') ?? '';
        const type = this.getAttribute('type') ?? 'text';
        const error = this.getAttribute('error') ?? '';
        const helper = this.getAttribute('helper') ?? '';
        const disabled = this.hasAttribute('disabled');
        const required = this.hasAttribute('required');
        const name = this.getAttribute('name') ?? '';

        // Label (mediante atributo 'label' o proyectado con slot="label")
        this.#labelText.textContent = label;
        const mostrarLabel = Boolean(label) || this.#tieneSlotAsignado('label');
        this.#label.hidden = !mostrarLabel;

        // Atributos del input interno
        this.#input.type = type;
        this.#input.placeholder = placeholder;
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
    }
}

customElements.define('custom-text', CustomText);