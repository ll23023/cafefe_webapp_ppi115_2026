/**
 * Extiende HTMLButtonElement y representa un botón de posición absoluta,
 * Su estructura interna se obtiene al clonar la plantilla definida en botonFlotante.html
 */
class CustomBotonFlotante extends HTMLButtonElement {
  static observedAttributes = ['texto'];

  /** Referencia al párrafo que contiene el texto variable. */
  #texto;

  /**
   * Se invoca cuando el elemento es insertado en el documento.
   * La plantilla se clona una única vez; las inserciones posteriores
   * (por ejemplo, al reubicar el elemento) no duplican el contenido.
   * Las modificaciones de atributos y de hijos se realizan en este método
   * porque la especificación las restringe dentro del constructor.
   */
  connectedCallback() {
    if (this.#texto) return;

    // Un botón sin tipo explícito se comporta como "submit" dentro de un formulario.
    if (!this.hasAttribute('type')) this.type = 'button';

    const template = document.getElementById('custom-boton-flotante-template');
    const contenido = template.content.cloneNode(true);

    this.#texto = contenido.querySelector('.boton-flotante__texto');
    this.append(contenido);

    this.#render();
  }

  /**
   * Se invoca cuando cambia alguno de los atributos observados.
   * Mientras el contenido no haya sido clonado, la actualización se difiere
   * hasta connectedCallback.
   */
  attributeChangedCallback() {
    if (this.#texto) this.#render();
  }

  /**
   * Texto presentado en el botón. Su lectura y asignación se reflejan
   * en el atributo "texto". Por ejemplo puede reflejar: "Ver carrito" o "3 productos - 22.50" 
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

customElements.define('custom-boton-flotante', CustomBotonFlotante, { extends: 'button' });