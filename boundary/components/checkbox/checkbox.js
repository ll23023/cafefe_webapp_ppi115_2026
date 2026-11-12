class CustomCheckbox extends HTMLInputElement {
  static observedAttributes = ['label'];
  static #contador = 0;

  #label;

  // Un <input> no debe tocar sus atributos ni hijos en el constructor,
  // por eso todo el trabajo se hace en connectedCallback.
  connectedCallback() {
    if (this.#label) return;

    this.type = 'checkbox';

    // Clonar la plantilla HTML
    const template = document.getElementById('custom-checkbox-template');
    const contenido = template.content.cloneNode(true);

    this.#label = contenido.querySelector('.custom-checkbox__label');

    // El label necesita un id al cual apuntar (así también se marca al hacer click en el texto)
    if (!this.id) this.id = `custom-checkbox-${++CustomCheckbox.#contador}`;
    this.#label.htmlFor = this.id;

    // El texto va a la derecha de la cajita
    this.after(this.#label);

    this.#render();
  }

  disconnectedCallback() {
    this.#label?.remove();
    this.#label = null;
  }

  attributeChangedCallback() {
    if (this.#label) this.#render();
  }

  #render() {
    const texto = this.getAttribute('label') ?? '';

    this.#label.textContent = texto;
    this.#label.hidden = !texto;
  }
}

customElements.define('custom-checkbox', CustomCheckbox, { extends: 'input' });