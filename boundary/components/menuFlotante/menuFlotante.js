class CustomMenuFlotante extends HTMLElement {
  static observedAttributes = ['usuario'];

  #saludo;
  #login;
  #salir;

  connectedCallback() {
    if (this.#saludo) return;

    this.#adoptarPropiedades();

    const template = document.getElementById('custom-menu-flotante-template');
    const contenido = template.content.cloneNode(true);

    this.#saludo = contenido.querySelector('.menu-flotante__saludo');
    this.#login = contenido.querySelector('.menu-flotante__boton--login');
    this.#salir = contenido.querySelector('.menu-flotante__boton--salir');

    this.#login.addEventListener('click', () => this.#iniciarSesion());
    this.#salir.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('salir', { bubbles: true }));
    });

    this.append(contenido);
    this.#render();
  }

  attributeChangedCallback() {
    if (this.#saludo) this.#render();
  }

  /**
   * Nombre del usuario con la sesión iniciada. Una cadena vacía indica que no existe sesión.
   * La asignación de un valor vacío retira el atributo.
   * @type {string}
   */
  get usuario() {
    return this.getAttribute('usuario') ?? '';
  }

  set usuario(valor) {
    if (valor) this.setAttribute('usuario', valor);
    else this.removeAttribute('usuario');
  }

  /** Indica si existe una sesión iniciada. */
  get sesionIniciada() {
    return this.usuario !== '';
  }

  #iniciarSesion() {
    const evento = new CustomEvent('iniciar-sesion', { bubbles: true, cancelable: true });
    const continuar = this.dispatchEvent(evento);
    const ruta = this.getAttribute('ruta-login');

    if (continuar && ruta) window.location.assign(ruta);
  }

  /**
   * Traslada a los atributos las propiedades asignadas antes de que el componente fuera
   * definido. Esos valores quedan como propiedades propias del objeto y ocultan a los setters
   * de la clase; se eliminan y se reasignan para que se registren como atributos.
   */
  #adoptarPropiedades() {
    for (const propiedad of ['usuario']) {
      if (Object.hasOwn(this, propiedad)) {
        const valor = this[propiedad];
        delete this[propiedad];
        this[propiedad] = valor;
      }
    }
  }

  /**
   * Sincroniza el saludo y la visibilidad de los botones con el estado de la sesión.
   */
  #render() {
    const iniciada = this.sesionIniciada;

    this.#saludo.textContent = iniciada ? `Hola, ${this.usuario}!` : 'Bienvenido';
    this.#login.hidden = iniciada;
    this.#salir.hidden = !iniciada;
  }
}

customElements.define('custom-menu-flotante', CustomMenuFlotante);