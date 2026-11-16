export function renderLogin({ onLogin }) {
    const view = document.createElement('section');
    view.className = 'login-fondo';
    view.innerHTML = `<main class="login-panel"><img class="login-logo" src="/assets/images/cafefeLogo.png" alt="Logo Cafefe"><form class="login-form"><custom-text label="Usuario" name="usuario" required></custom-text><custom-text label="Contrasena" name="contrasena" type="password"></custom-text><p class="login-error" role="alert" hidden></p><div class="login-acciones"><custom-checkbox label="Recordarme" name="recordarme"></custom-checkbox><custom-boton-redondeado texto="Ingresar"></custom-boton-redondeado></div></form></main>`;
    const form = view.querySelector('form');
    const error = view.querySelector('.login-error');
    view.querySelector('custom-boton-redondeado').addEventListener('click', () => {
        const usuario = form.querySelector('[name="usuario"]');
        const contrasena = form.querySelector('[name="contrasena"]');
        if (usuario.value.trim()) onLogin(usuario.value, contrasena.value, error);
        else { error.hidden = false; error.textContent = 'Escribe tu nombre para continuar.'; }
    });
    form.addEventListener('submit', (event) => { event.preventDefault(); view.querySelector('custom-boton-redondeado').click(); });
    return view;
}
