class CustomTarjeta extends HTMLElement {
  static observedAttributes = ['endpoint', 'campo-titulo', 'campo-descripcion', 'campo-imagen', 'campo-precio'];

  static #formatoPrecio = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

  #contenedor = null;
  #titulo;
  #imagen;
  #descripcion;
  #precio;
  #boton;
  #datos = null;
  #entidad = null;
  #cargas = 0;

  connectedCallback() {
    if (!this.#contenedor) {
      const template = document.getElementById('custom-tarjeta-template');
      const contenido = template.content.cloneNode(true);

      this.#contenedor = contenido.querySelector('.tarjeta__contenedor');
      this.#titulo = contenido.querySelector('.tarjeta__titulo');
      this.#imagen = contenido.querySelector('.tarjeta__imagen');
      this.#descripcion = contenido.querySelector('.description');
      this.#precio = contenido.querySelector('.tarjeta__precio');
      this.#boton = contenido.querySelector('.tarjeta__agregar');

      const piezas = [this.#contenedor, this.#titulo, this.#imagen, this.#descripcion, this.#precio, this.#boton];
      if (piezas.some((pieza) => !pieza)) {
        this.#contenedor = null;
        throw new Error('La plantilla custom-tarjeta-template está incompleta o desactualizada: use la versión actual de tarjeta.html');
      }

      this.#boton.addEventListener('click', () => this.#emitirAgregar());
      this.append(contenido);
    }

    this.#render();
    if (this.hasAttribute('endpoint') && !this.#datos) this.recargar();
  }

  disconnectedCallback() {
    // Invalida cualquier carga en curso; los hijos se conservan por si el nodo se vuelve a insertar.
    this.#cargas++;
  }

  attributeChangedCallback(nombre, anterior, nuevo) {
    if (!this.#contenedor || anterior === nuevo) return;
    if (nombre === 'endpoint') {
      this.#datos = null;
      this.recargar();
    } else {
      this.#render();
    }
  }

  /** Entidad (o JSON) que la tarjeta presenta. Asignarla evita consultar el endpoint. */
  get datos() {
    return this.#datos;
  }

  set datos(valor) {
    this.#datos = valor ?? null;
    delete this.dataset.estado;
    if (this.#contenedor) this.#render();
  }

  /** Consulta nuevamente el endpoint y actualiza la tarjeta. */
  async recargar() {
    const endpoint = this.getAttribute('endpoint');
    if (!endpoint || !this.#contenedor) return;

    const carga = ++this.#cargas;
    this.dataset.estado = 'cargando';

    try {
      const { dao, id } = DefaultDAO.desdeEndpoint(endpoint);
      if (!id) throw new TypeError('El endpoint debe incluir el identificador, p. ej. producto/<uuid>');

      const modelo = new Model(dao);
      await modelo.cargarUno(id);
      if (carga !== this.#cargas) return;
      if (modelo.error) throw modelo.error;

      this.#entidad = dao.entidad;
      this.#datos = modelo.registros[0];
      this.dataset.estado = 'listo';
      this.#render();
    } catch (error) {
      if (carga !== this.#cargas) return;
      this.#datos = null;
      this.dataset.estado = 'error';
      this.#render(error.message);
      this.dispatchEvent(new CustomEvent('tarjeta-error', { bubbles: true, detail: { endpoint, error } }));
    }
  }

  #campos() {
    const entidad = this.#entidad ?? this.#datos?.constructor;
    const propios = entidad?.CAMPOS_TARJETA ?? {};
    return {
      titulo: this.getAttribute('campo-titulo') ?? propios.titulo ?? 'nombre',
      descripcion: this.getAttribute('campo-descripcion') ?? propios.descripcion ?? 'descripcion',
      imagen: this.getAttribute('campo-imagen') ?? propios.imagen ?? null,
      precio: this.getAttribute('campo-precio') ?? propios.precio ?? null
    };
  }

  #render(mensajeError = '') {
    const datos = this.#datos;
    const campos = this.#campos();
    const titulo = datos ? String(datos[campos.titulo] ?? '') : '';
    const imagen = datos && campos.imagen ? datos[campos.imagen] : '';

    this.#titulo.textContent = titulo;
    this.#descripcion.textContent = datos ? String(datos[campos.descripcion] ?? '') : mensajeError;
    this.#precio.textContent = datos && campos.precio ? CustomTarjeta.#darFormato(datos[campos.precio]) : '';

    if (imagen) {
      this.#imagen.src = imagen;
      this.#imagen.alt = titulo;
      this.#imagen.hidden = false;
    } else {
      this.#imagen.removeAttribute('src');
      this.#imagen.hidden = true;
    }

    this.#boton.disabled = !datos;
  }

  static #darFormato(valor) {
    if (valor === null || valor === undefined || valor === '') return '';
    return Number.isFinite(Number(valor)) ? CustomTarjeta.#formatoPrecio.format(Number(valor)) : String(valor);
  }

  #emitirAgregar() {
    this.dispatchEvent(new CustomEvent('tarjeta-agregar', {
      bubbles: true,
      detail: { endpoint: this.getAttribute('endpoint'), datos: this.#datos }
    }));
  }
}

customElements.define('custom-tarjeta', CustomTarjeta);