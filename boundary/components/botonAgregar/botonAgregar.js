class CustomAddButton extends HTMLButtonElement {
  // Un <button> no debe tocar sus hijos en el constructor: el trabajo va en connectedCallback.
  connectedCallback() {
    if (this.querySelector('.add-button__barra')) return;

    const template = document.getElementById('custom-add-button-template');
    this.append(template.content.cloneNode(true));

    if (!this.hasAttribute('type')) this.type = 'button';
    if (!this.hasAttribute('aria-label')) this.setAttribute('aria-label', 'Agregar');
  }
}

customElements.define('custom-add-button', CustomAddButton, { extends: 'button' });
