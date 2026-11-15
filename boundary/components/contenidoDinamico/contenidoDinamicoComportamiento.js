/**
 * Componente para crear un contenedor dinamico.
 * 
 * @author MikeLB
 */
class ContenidoDinamico extends HTMLElement {
    #contenido;
    constructor() {
        // Se utiliza para implementar la herencia de la clase HTMLElement y así poder utilizar sus propiedades y métodos.
        super();

        // Se utiliza para crear un espacio aislado donde se puede insertar contenido.
        this.attachShadow({ mode: 'open' });

        // Se utiliza para clonar el contenido de la plantilla y insertarlo en el espacio aislado.
        this.shadowRoot.innerHTML = '<link rel="stylesheet" href="/boundary/components/contenidoDinamico/contenidoDinamicoEstilo.css"><section class="contenido-dinamico"><slot></slot></section>';
        this.#contenido = this.shadowRoot.querySelector('.contenido-dinamico');
    }

    connectedCallback() {
        console.log('ContenidoDinamico connected');
    }

    mostrar(panel) {
        for (const elemento of this.children) elemento.hidden = elemento !== panel;
        if (panel && !panel.hidden) panel.hidden = false;
    }
}

customElements.define('contenido-dinamico', ContenidoDinamico);