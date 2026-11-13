/**
 * Componente para crear un contenedor dinamico.
 * 
 * @author Miguel Liborio
 */
class ContenidoDinamico extends HTMLElement {
    constructor() {
        // Se utiliza para implementar la herencia de la clase HTMLElement y así poder utilizar sus propiedades y métodos.
        super();

        // Se utiliza para crear un espacio aislado donde se puede insertar contenido.
        this.attachShadow({ mode: 'open' });

        // Se utiliza para clonar el contenido de la plantilla y insertarlo en el espacio aislado.
        this.shadowRoot.appendChild(document.getElementById('contenidoDinamico-template').content.cloneNode(true));
    }

    connectedCallback() {
        console.log('ContenidoDinamico connected');
    }
}

customElements.define('contenido-dinamico', ContenidoDinamico);