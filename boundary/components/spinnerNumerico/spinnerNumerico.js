class CustomSpinnerNumerico extends HTMLInputElement {
  static observedAttributes = ['min', 'max', 'step', 'disabled', 'readonly'];

  #wrapper;
  #menos;
  #mas;
  #moviendo = false;

  constructor() {
    super();

    // Los botones se actualizan cuando el valor cambia (escribiendo o con los botones)
    this.addEventListener('input', () => this.#actualizarBotones());
    this.addEventListener('change', () => this.#actualizarBotones());
  }

  // Un <input> no debe tocar sus atributos ni hijos en el constructor,
  // por eso todo el trabajo se hace en connectedCallback.
  connectedCallback() {
    if (this.#wrapper) return;

    this.type = 'number';
    if (this.value === '') this.value = this.min || '0';

    // Clonar la plantilla HTML
    const template = document.getElementById('custom-spinner-numerico-template');
    const contenido = template.content.cloneNode(true);

    this.#wrapper = contenido.querySelector('.custom-spinner');
    this.#menos = contenido.querySelector('.custom-spinner__boton--menos');
    this.#mas = contenido.querySelector('.custom-spinner__boton--mas');
    const campo = contenido.querySelector('.custom-spinner__campo');

    this.#menos.addEventListener('click', () => this.#mover(-1));
    this.#mas.addEventListener('click', () => this.#mover(1));

    // La caja se coloca donde estaba el input y el input pasa a vivir en el centro.
    // Mover el input dispara disconnected/connected, por eso la bandera #moviendo.
    this.#moviendo = true;
    this.before(this.#wrapper);
    campo.append(this);
    this.#moviendo = false;

    this.#actualizarBotones();
  }

  disconnectedCallback() {
    if (this.#moviendo || !this.#wrapper) return;

    // Si el input sigue dentro de su caja, se quitó un contenedor más arriba: no se toca nada.
    if (this.parentElement?.classList.contains('custom-spinner__campo')) return;

    // Si el input salió solo, se limpia la caja que quedó vacía.
    this.#wrapper.remove();
    this.#wrapper = null;
    this.#menos = null;
    this.#mas = null;
  }

  attributeChangedCallback() {
    this.#actualizarBotones();
  }

  #mover(direccion) {
    // stepUp / stepDown ya respetan min, max y step del input nativo
    if (direccion < 0) this.stepDown();
    else this.stepUp();

    // Estos métodos no avisan que el valor cambió, así que se avisa a mano
    this.dispatchEvent(new Event('input', { bubbles: true }));
    this.dispatchEvent(new Event('change', { bubbles: true }));
  }

  #actualizarBotones() {
    if (!this.#menos) return;

    const valor = this.valueAsNumber;
    const bloqueado = this.disabled || this.readOnly;

    this.#menos.disabled = bloqueado || (this.min !== '' && valor <= Number(this.min));
    this.#mas.disabled = bloqueado || (this.max !== '' && valor >= Number(this.max));
  }
}

customElements.define('custom-spinner-numerico', CustomSpinnerNumerico, { extends: 'input' });