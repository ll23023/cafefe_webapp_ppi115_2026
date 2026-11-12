class CustomNotificacion extends HTMLElement {
  static observedAttributes = ['texto', 'tipo', 'duracion'];

  /** Duración, en milisegundos, utilizada cuando el atributo "duracion" no es válido. */
  static #DURACION_PREDETERMINADA = 5000;

  #texto;
  #cerrar;
  #temporizador;

  /**
   * Se invoca cuando el elemento es insertado en el documento.
   * La plantilla se clona una única vez; las inserciones posteriores
   * no duplican el contenido.
   */
  connectedCallback() {
    if (this.#texto) return;

    this.#adoptarPropiedades();

    const template = document.getElementById('custom-notificacion-template');
    const contenido = template.content.cloneNode(true);

    this.#texto = contenido.querySelector('.notificacion__texto');
    this.#cerrar = contenido.querySelector('.notificacion__cerrar');
    this.#temporizador = contenido.querySelector('.notificacion__temporizador');

    this.#cerrar.addEventListener('click', () => this.cerrar());

    // El fin de la animación del temporizador indica que el tiempo del aviso se agotó.
    this.#temporizador.addEventListener('animationend', () => this.cerrar());

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

  /** Mensaje del aviso. Su lectura y asignación se reflejan en el atributo "texto". */
  get texto() {
    return this.getAttribute('texto') ?? '';
  }

  set texto(valor) {
    this.setAttribute('texto', valor);
  }

  /** Variante visual: "fracaso" o, en cualquier otro caso, "exito". */
  get tipo() {
    return this.getAttribute('tipo') === 'fracaso' ? 'fracaso' : 'exito';
  }

  set tipo(valor) {
    this.setAttribute('tipo', valor);
  }

  /** Duración del aviso en milisegundos. */
  get duracion() {
    const valor = Number(this.getAttribute('duracion'));
    return valor > 0 ? valor : CustomNotificacion.#DURACION_PREDETERMINADA;
  }

  set duracion(valor) {
    this.setAttribute('duracion', valor);
  }

  /**
   * Cierra la notificación. El evento se emite antes de retirar el elemento
   * para que pueda propagarse hacia sus ancestros.
   */
  cerrar() {
    this.dispatchEvent(new CustomEvent('notificacion-cerrada', { bubbles: true }));
    this.remove();
  }

  /**
   * Traslada a los atributos las propiedades asignadas antes de que el componente fuera
   * definido. Si un elemento se crea y se configura (por ejemplo, aviso.tipo = 'fracaso')
   * antes de que customElements.define se ejecute, esos valores quedan como propiedades
   * propias del objeto y ocultan a los setters de la clase. Se eliminan y se reasignan
   * para que se registren como atributos.
   */
  #adoptarPropiedades() {
    for (const propiedad of ['texto', 'tipo', 'duracion']) {
      if (Object.hasOwn(this, propiedad)) {
        const valor = this[propiedad];
        delete this[propiedad];
        this[propiedad] = valor;
      }
    }
  }

  /**
   * Sincroniza el contenido, el rol de accesibilidad y la duración del temporizador
   * con los atributos del componente.
   */
  #render() {
    this.#texto.textContent = this.texto;

    // Los fallos se anuncian de inmediato a los lectores de pantalla; los éxitos, de forma discreta.
    this.setAttribute('role', this.tipo === 'fracaso' ? 'alert' : 'status');

    this.style.setProperty('--notificacion-duracion', `${this.duracion}ms`);
  }
}

customElements.define('custom-notificacion', CustomNotificacion);