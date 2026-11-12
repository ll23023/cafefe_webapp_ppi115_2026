class CustomText extends HTMLInputElement {
  static observedAttributes = ['label', 'helper', 'error'];
  static #contador = 0;

  #label;
  #message;

  // Un <input> no debe tocar sus atributos ni hijos en el constructor,
  // todo el trabajo se hace en connectedCallback.
  connectedCallback() {
    if (this.#label) return;

    const template = document.getElementById('custom-text-template');
    const contenido = template.content.cloneNode(true);

    this.#label = contenido.querySelector('.custom-text__label');
    this.#message = contenido.querySelector('.custom-text__message');

    // El label necesita un id al cual apuntar
    if (!this.id) this.id = `custom-text-${++CustomText.#contador}`;
    this.#label.htmlFor = this.id;

    // El label va antes del input y el mensaje después
    this.before(this.#label);
    this.after(this.#message);

    this.#render();
  }

  disconnectedCallback() {
    this.#label?.remove();
    this.#message?.remove();
    this.#label = null;
    this.#message = null;
  }

  attributeChangedCallback() {
    if (this.#label) this.#render();
  }

  #render() {
    const label = this.getAttribute('label') ?? '';
    const error = this.getAttribute('error') ?? '';
    const helper = this.getAttribute('helper') ?? '';
    const mensaje = error || helper;

    this.#label.textContent = label;
    this.#label.hidden = !label;

    this.#message.textContent = mensaje;
    this.#message.hidden = !mensaje;

    this.classList.toggle('custom-text--error', Boolean(error));
    this.setAttribute('aria-invalid', String(Boolean(error)));
  }
}

customElements.define('custom-text', CustomText, { extends: 'input' });