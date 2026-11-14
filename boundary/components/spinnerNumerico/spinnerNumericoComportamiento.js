/**
 * Componente para crear un spinner numérico con botones de incremento y decremento. 
 *
 * @author Mil
 */

class SpinnerNumerico extends HTMLElement {
    
    static observedAttributes = ['min', 'max', 'step', 'value', 'disabled', 'readonly', 'required', 'name', 'label'];

    #input;
    #menos;
    #mas;
    #inicializado = false;

    constructor() {
        super();

        this.attachShadow({ mode: 'open' });

        const template = document.getElementById('spinner-numerico-template');
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this.#input = this.shadowRoot.querySelector('.spinner-numerico__input');
        this.#menos = this.shadowRoot.querySelector('.spinner-numerico__boton--menos');
        this.#mas = this.shadowRoot.querySelector('.spinner-numerico__boton--mas');

        this.#menos.addEventListener('click', () => this.#mover(-1));
        this.#mas.addEventListener('click', () => this.#mover(1));

        for (const tipo of ['input', 'change']) {
            this.#input.addEventListener(tipo, (evento) => {
                evento.stopPropagation();
                this.#actualizarBotones();
                this.dispatchEvent(new Event(tipo, { bubbles: true, composed: true }));
            });
        }
    }

    connectedCallback() {
        if (!this.#inicializado) {
            this.#input.value = this.getAttribute('value') ?? this.getAttribute('min') ?? '0';
            this.#inicializado = true;
        }
        this.#render();
    }

    attributeChangedCallback(nombre, valorAnterior, valorNuevo) {
        if (valorAnterior === valorNuevo || !this.#input) return;

        if (nombre === 'value') {
            this.#input.value = valorNuevo ?? '';
        }
        this.#render();
    }

    get value() {
        return this.#input.value;
    }

    set value(valor) {
        const nuevoValor = valor == null ? '' : String(valor);
        this.setAttribute('value', nuevoValor);
    }

    #render() {
        for (const nombre of ['min', 'max', 'step', 'name']) {
            if (this.hasAttribute(nombre)) {
                this.#input.setAttribute(nombre, this.getAttribute(nombre));
            } else {
                this.#input.removeAttribute(nombre);
            }
        }

        for (const nombre of ['disabled', 'readonly', 'required']) {
            this.#input.toggleAttribute(nombre, this.hasAttribute(nombre));
        }

        const etiqueta = this.getAttribute('label');
        this.#input.setAttribute('aria-label', etiqueta || 'Cantidad');
        this.#actualizarBotones();
    }

    #mover(direccion) {
        if (direccion < 0) this.#input.stepDown();
        else this.#input.stepUp();

        this.#actualizarBotones();
        for (const tipo of ['input', 'change']) {
            this.dispatchEvent(new Event(tipo, { bubbles: true, composed: true }));
        }
    }

    #actualizarBotones() {
        if (!this.#input) return;

        const valor = this.#input.valueAsNumber;
        const bloqueado = this.#input.disabled || this.#input.readOnly;
        const min = this.#input.min === '' ? null : Number(this.#input.min);
        const max = this.#input.max === '' ? null : Number(this.#input.max);

        this.#menos.disabled = bloqueado || (Number.isFinite(valor) && min !== null && valor <= min);
        this.#mas.disabled = bloqueado || (Number.isFinite(valor) && max !== null && valor >= max);
    }
}

customElements.define('spinner-numerico', SpinnerNumerico);