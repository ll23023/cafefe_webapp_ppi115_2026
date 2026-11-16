const normalizarNombre = (valor) => String(valor ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

function iconoPorNombre(nombre) {
    const categoria = normalizarNombre(nombre);
    if (/mercancia/.test(categoria)) return './assets/icons/49599639-59e0-4012-a9c9-db3898a20d57.png';
    if (/panaderia|comida|perecedero/.test(categoria)) return './assets/icons/e8c424db-e79e-4f20-8807-4d3b26c594a0.png';
    if (/postre|dulce/.test(categoria)) return './assets/icons/5e90e6c3-e061-4a83-9e50-038261a63536.png';
    return './assets/icons/db92d7fc-3cd0-40bb-9cba-c6c19b122ea5.png';
}

/**
 * Componente utilizado para crear un filtro circular.
 * 
 * @author MikeLB
 */
class FiltroCircular extends HTMLElement {
    static observedAttributes = ['filtroId', 'nombre'];

    // Propiedad estática que contendrá la plantilla del componente.
    static _template;

    // Propiedad privada del componente para obtener el ID del filtro.
    _filtroId;

    // Propiedad privada que indica si el filtro está seleccionado o no.
    _estaActivo = false;

    // Propiedad privada que indica si la plantilla ha sido clonada o no.
    _isCloned = false;

    // Se define el constructor del componente.
    constructor() {
        super();

        this.attachShadow({ mode: 'open' });

    }

    // Se define el método privado que obtiene la plantilla del componente.
    async _getTemplate() {

        // Verifica si la plantilla ya ha sido cargada, si no, la carga desde el archivo HTML.
        if (!FiltroCircular._template) {
            FiltroCircular._template = fetch('./js/boundary/components/filtroCircular/filtroCircularPlantilla.html')

                // Comprobamos si la respuesta de la solicitud es correcta, si no, lanzamos un error.
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`Error al cargar la plantilla: ${response.statusText}`);
                    }

                    // Si la respuesta es correcta, convertimos la respuesta a texto y la devolvemos.
                    return response.text();
                })

                // Parseamos el texto de la plantilla a un documento HTML y devolvemos el elemento que contiene la plantilla.
                .then((html) => {
                    const doc = new DOMParser().parseFromString(html, 'text/html');

                    return doc.querySelector('[filtro-circular-plantilla]');
                });
        }

        // Devolvemos la plantilla del componente.
        return FiltroCircular._template;
    }

    // Se define el método privado que renderiza el componente en el DOM.
    async _renderElement() {
        const template = await this._getTemplate();

        // Verifficamos si la plantilla ya ha sido clonada, si no, la clonamos y la agregamos al shadow DOM del componente.
        if (!this._isCloned) {
            this.shadowRoot.appendChild(template.content.cloneNode(true));

            // Obtenemos el valor del atributo 'filtroId' del componente y lo asignamos a la propiedad privada '_filtroId' si existe.
            this._filtroId = this.hasAttribute('filtroId') ? this.getAttribute('filtroId') : '';

            // Si el atributo 'filtroId' existe, actualizamos la imagen del filtro circular con la ruta correspondiente.
            const imagen = this.shadowRoot.querySelector('.filtroCircular__imagen');

            this.shadowRoot.querySelector('.filtroCircular__checkbox').addEventListener('change', (event) => {
                // TODO: Agregar la lógica para obtener una lista de entidades filtradas según el filtro seleccionado.
                this._estaActivo = event.target.checked;
                this.shadowRoot.querySelector('.filtroCircular__contenido').classList.toggle('seleccionado');
                this.dispatchEvent(new CustomEvent('filtro-seleccionado', {
                    detail: { categoria: this._filtroId, activo: this._estaActivo },
                    bubbles: true,
                    composed: true
                }));
            });

            // Cambiamos el estado de la propiedad '_isCloned' a true para indicar que la plantilla ha sido clonada y agregada al shadow DOM.
            this._isCloned = true;
        }

        this._filtroId = this.getAttribute('filtroId') ?? '';
        const imagen = this.shadowRoot.querySelector('.filtroCircular__imagen');
        const imagenPorDefecto = iconoPorNombre(this.getAttribute('nombre'));
        imagen.onerror = function() {
            this.onerror = null;
            this.src = imagenPorDefecto;
        };
        imagen.src = this._filtroId
            ? `./assets/icons/${encodeURIComponent(this._filtroId)}.png`
            : imagenPorDefecto;
        imagen.alt = this.getAttribute('nombre') || this._filtroId || 'Categoria';
    }


    // Se define el método que se ejecuta cuando el componente se agrega al DOM.
    connectedCallback() {
        this._renderElement().catch((error) => console.error(error));
    }

    // Este método se utiliza para actualizar el estado del componente cuando se cambian sus atributos.
    attributeChangedCallback(nombre, valorAnterior, valorNuevo) {
        if (valorAnterior !== valorNuevo && this.isConnected) {
            this._renderElement().catch((error) => console.error(error));
        }
    }
}

// Registramos y exportamos el componente para que pueda ser utilizado en otros archivos.
export { FiltroCircular };
customElements.define('filtro-circular', FiltroCircular);