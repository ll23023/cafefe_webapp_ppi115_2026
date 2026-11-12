/**
 * Componente personalizado «botonRedondo» (RoundButton).
 *
 * Extiende HTMLButtonElement. Contiene un párrafo <p> con texto variable y admite
 * dos variantes visuales, seleccionadas mediante el atributo "tipo":
 *   - primary:   acción principal (variante predeterminada).
 *   - secondary: acción secundaria.
 *
 * Uso:
 *   <button is="custom-boton-redondo" tipo="primary" texto="Completar orden"></button>
 *   <button is="custom-boton-redondo" tipo="secondary" texto="Seguir comprando"></button>
 *
 * Atributos observados:
 *   - texto: contenido que se presenta en el párrafo del botón.
 *
 * El atributo "tipo" no requiere observación: la variante se resuelve íntegramente en CSS.
 */
class CustomBotonRedondo extends HTMLButtonElement {
  static observedAttributes = ['texto'];

  /** Referencia al párrafo que contiene el texto variable. */
  #texto;

  /**
   * Se invoca cuando el elemento es insertado en el documento.
   * La plantilla se clona una única vez; las inserciones posteriores
   * no duplican el contenido. Las modificaciones de atributos y de hijos
   * se realizan en este método porque la especificación las restringe
   * dentro del constructor.
   */
  connectedCallback() {
    if (this.#texto) return;

    // Un botón sin tipo explícito se comporta como "submit" dentro de un formulario.
    if (!this.hasAttribute('type')) this.type = 'button';

    const template = document.getElementById('custom-boton-redondo-template');
    const contenido = template.content.cloneNode(true);

    this.#texto = contenido.querySelector('.boton-redondo__texto');
    this.append(contenido);

    this.#render();
  }

  /**
   * Se invoca cuando cambia el atributo observado. Mientras el contenido no haya
   * sido clonado, la actualización se difiere hasta connectedCallback.
   */
  attributeChangedCallback() {
    if (this.#texto) this.#render();
  }

  /**
   * Texto presentado en el botón. Su lectura y asignación se reflejan
   * en el atributo "texto".
   * @type {string}
   */
  get texto() {
    return this.getAttribute('texto') ?? '';
  }

  set texto(valor) {
    this.setAttribute('texto', valor);
  }

  /**
   * Sincroniza el contenido del párrafo con el atributo "texto".
   * El párrafo se oculta cuando no existe texto que mostrar.
   */
  #render() {
    this.#texto.textContent = this.texto;
    this.#texto.hidden = !this.texto;
  }
}

customElements.define('custom-boton-redondo', CustomBotonRedondo, { extends: 'button' });