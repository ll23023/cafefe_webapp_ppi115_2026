/**
 * Componente para crear un contenedor dinamico.
 * 
 * @author MikeLB
 */
class ContenidoDinamico extends HTMLElement {
    static _template;

    _isRendered = false;
    _renderPromise;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    _getTemplate() {
        if (!ContenidoDinamico._template) {
            ContenidoDinamico._template = fetch('./js/boundary/components/contenidoDinamico/contenidoDinamicoPlantilla.html')
                .then((response) => {
                    if (!response.ok) throw new Error(`Error al cargar la plantilla: ${response.statusText}`);
                    return response.text();
                })
                .then((html) => {
                    const template = new DOMParser().parseFromString(html, 'text/html')
                        .querySelector('[contenido-dinamico-plantilla]');
                    if (!template) throw new Error('No se encontró la plantilla de contenido dinámico.');
                    return template;
                });
        }
        return ContenidoDinamico._template;
    }

    _renderElement() {
        if (!this._renderPromise) {
            this._renderPromise = this._getTemplate().then((template) => {
                this.shadowRoot.appendChild(template.content.cloneNode(true));
                this._isRendered = true;
            });
        }
        return this._renderPromise.then(() => {
        });
    }

    connectedCallback() {
        this._renderElement().catch((error) => console.error(error));
    }

    mostrar(panel) {
        for (const elemento of this.children) elemento.hidden = elemento !== panel;
        if (panel && !panel.hidden) panel.hidden = false;
    }
}

customElements.define('contenido-dinamico', ContenidoDinamico);