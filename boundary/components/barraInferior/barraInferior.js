/**
 * Los botones se exponen mediante las propiedades botonSecundario y botonPrimario,
 * a fin de que el código externo pueda asociarles eventos.
 */
class CustomBarraInferior extends HTMLElement {
  static observedAttributes = ['texto', 'texto-secundario', 'texto-primario'];

  #texto;
  #secundario;
  #primario;

  /**
   * Se invoca cuando el elemento es insertado en el documento.
   * La plantilla se clona una única vez; las inserciones posteriores
   * no duplican el contenido.
   *
   * Se emplea document.importNode en lugar de cloneNode porque el contenido de un
   * <template> pertenece a un documento inerte: importarlo al documento activo
   * garantiza que los botones personalizados internos sean creados y actualizados
   * como instancias de custom-boton-redondo.
   */
  connectedCallback() {
    if (this.#texto) return;

    const template = document.getElementById('custom-barra-inferior-template');
    const contenido = document.importNode(template.content, true);

    this.#texto = contenido.querySelector('.barra-inferior__texto');
    this.#secundario = contenido.querySelector('[tipo="secondary"]');
    this.#primario = contenido.querySelector('[tipo="primary"]');
    this.append(contenido);

    this.#render();
  }

  /**
   * Se invoca cuando cambia alguno de los atributos observados. Mientras el contenido
   * no haya sido clonado, la actualización se difiere hasta connectedCallback.
   */
  attributeChangedCallback() {
    if (this.#texto) this.#render();
  }

  get botonSecundario() {
    return this.#secundario;
  }

  get botonPrimario() {
    return this.#primario;
  }

  /**
   * Texto presentado en la barra. Su lectura y asignación se reflejan
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
   * Sincroniza el párrafo y los botones con los atributos del componente.
   * El párrafo se oculta cuando no existe texto que mostrar.
   */
  #render() {
    this.#texto.textContent = this.texto;
    this.#texto.hidden = !this.texto;

    this.#secundario.setAttribute('texto', this.getAttribute('texto-secundario') ?? '');
    this.#primario.setAttribute('texto', this.getAttribute('texto-primario') ?? '');
  }
}

customElements.define('custom-barra-inferior', CustomBarraInferior);