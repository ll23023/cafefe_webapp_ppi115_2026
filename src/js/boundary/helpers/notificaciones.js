export function mostrarNotificacion(texto, tipo = 'exito') {
    const contenedor = document.querySelector('#app .toast');
    if (!contenedor) {
        console.error('No se encontró el contenedor de notificaciones.');
        return;
    }

    const notificacion = document.createElement('custom-notificacion');
    notificacion.setAttribute('texto', texto);
    notificacion.setAttribute('tipo', tipo);
    contenedor.replaceChildren(notificacion);
}
