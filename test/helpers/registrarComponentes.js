export async function registrarComponentes(rutas) {
    for (const ruta of rutas) {
        const respuesta = await fetch(ruta);
        if (!respuesta.ok) {
            throw new Error(`No se pudo cargar el componente: ${ruta}`);
        }

        const documento = new DOMParser().parseFromString(await respuesta.text(), 'text/html');
        const plantilla = documento.querySelector('template');
        const script = documento.querySelector('script[type="module"][src]');
        if (!plantilla || !script) {
            throw new Error(`El archivo no contiene una plantilla y un script de componente: ${ruta}`);
        }

        document.body.appendChild(document.importNode(plantilla, true));
        const urlScript = new URL(script.getAttribute('src'), new URL(ruta, location.href));
        await import(urlScript.href);
    }
}
