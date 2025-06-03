console.log("✅ registro.js cargado correctamente");

// ✅ Mostrar mensajes bonitos en la página (igual que en login)
function mostrarMensaje(texto, tipo = 'error') {
    let mensaje = document.getElementById('mensaje');
    if (!mensaje) {
        mensaje = document.createElement('div');
        mensaje.id = 'mensaje';
        mensaje.style.padding = '10px';
        mensaje.style.margin = '10px 0';
        mensaje.style.borderRadius = '5px';
        mensaje.style.fontWeight = 'bold';
        mensaje.style.textAlign = 'center';
        mensaje.style.transition = 'all 0.5s ease';
        document.getElementById('sign-Up').prepend(mensaje);
    }

    mensaje.className = '';
    mensaje.style.display = 'block';
    mensaje.style.opacity = '1';

    mensaje.style.backgroundColor = tipo === 'success' ? '#d4edda' : '#f8d7da';
    mensaje.style.color = tipo === 'success' ? '#155724' : '#721c24';
    mensaje.style.border = tipo === 'success'
        ? '1px solid #c3e6cb'
        : '1px solid #f5c6cb';

    mensaje.innerHTML = texto;

    setTimeout(() => {
        mensaje.style.opacity = '0';
        setTimeout(() => {
            mensaje.style.display = 'none';
        }, 500);
    }, 4000);
}

// ✅ Validaciones individuales reutilizables
function tieneSecuenciasInvalidas(texto) {
    return /[aeiou]{3}/i.test(texto) || /[^aeiou\s\d]{4}/i.test(texto);
}

function esFechaValida(fecha) {
    const hoy = new Date();
    const nacimiento = new Date(fecha);
    const edad = hoy.getFullYear() - nacimiento.getFullYear();
    return !isNaN(nacimiento.getTime()) && nacimiento <= hoy && edad <= 90;
}

function esTelefonoValido(telefono) {
    return /^[67]\d{7}$/.test(telefono);
}

function esCorreoValido(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function esUsuarioValido(usuario) {
    return usuario.length >= 6 && usuario.length <= 15;
}

function esPasswordFuerte(password) {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
}

function esNumeroPuertaValido(nro) {
    return /^\d{1,4}$/.test(nro);
}

function esCiudadValida(ciudad) {
    const ciudades = ['LA PAZ', 'EL ALTO', 'COCHABAMBA', 'SANTA CRUZ', 'TARIJA', 'BENI', 'PANDO', 'ORURO', 'POTOSI', 'CHUQUISACA'];
    return ciudades.includes(ciudad.toUpperCase());
}

document.getElementById('sign-Up').addEventListener('submit', async function(event) {
    event.preventDefault();

    // Capturar datos
    const nombre = document.getElementById('name').value.trim();
    const ap_paterno = document.getElementById('Ap_paterno').value.trim();
    const ap_materno = document.getElementById('Ap_materno').value.trim();
    const ci = document.getElementById('Carnet_i').value.trim();
    const fecha_nacimiento = document.getElementById('Fecha_nacimiento').value.trim();
    const email = document.getElementById('email-register').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const ciudad = document.getElementById('ciudad').value.trim();
    const zona = document.getElementById('Zona').value.trim();
    const calle = document.getElementById('Calle').value.trim();
    const puerta = document.getElementById('Puerta').value.trim();
    const nombre_usuario = document.getElementById('Usuario').value.trim();
    const password = document.getElementById('password-register').value.trim();

    // Validaciones
    for (let campo of [nombre, ap_paterno, ap_materno, zona, calle]) {
        if (tieneSecuenciasInvalidas(campo)) {
            mostrarMensaje('❌ No se permiten 3 vocales o 4 consonantes seguidas en nombre, apellido, zona o calle.');
            return;
        }
    }

    if (!esFechaValida(fecha_nacimiento)) {
        mostrarMensaje('❌ La fecha de nacimiento es inválida o supera los 90 años.');
        return;
    }

    if (!esTelefonoValido(telefono)) {
        mostrarMensaje('❌ El teléfono debe tener 8 dígitos y comenzar con 6 o 7.');
        return;
    }

    if (!esCorreoValido(email)) {
        mostrarMensaje('❌ El correo electrónico no es válido.');
        return;
    }

    if (!esUsuarioValido(nombre_usuario)) {
        mostrarMensaje('❌ El nombre de usuario debe tener entre 6 y 15 caracteres.');
        return;
    }

    if (!esPasswordFuerte(password)) {
        mostrarMensaje('❌ La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.');
        return;
    }

    if (!esNumeroPuertaValido(puerta)) {
        mostrarMensaje('❌ El número de puerta debe tener hasta 4 dígitos.');
        return;
    }

    if (!esCiudadValida(ciudad)) {
        mostrarMensaje('❌ Ciudad no válida. Elija una ciudad permitida.');
        return;
    }

    // Validación final de campos obligatorios
    if (!nombre || !ap_paterno || !ci || !fecha_nacimiento || !email || !nombre_usuario || !password) {
        mostrarMensaje('❌ Por favor llena todos los campos obligatorios.');
        return;
    }

    try {
        const response = await fetch('http://dreamdressv2.test/backend/api/registro_api.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nombre,
                ap_paterno,
                ap_materno,
                ci,
                fecha_nacimiento,
                email,
                telefono,
                ciudad,
                zona,
                calle,
                puerta,
                nombre_usuario,
                contrasena: password
            })
        });

        const data = await response.json();
        console.log("📥 Respuesta del servidor:", data);

        if (data.status === 'success') {
            mostrarMensaje('✅ Usuario registrado exitosamente. Ahora puedes iniciar sesión.', 'success');
            setTimeout(() => {
                window.location.href = 'http://dreamdressv2.test/frontend/login/login.html';
            }, 2000);
        } else {
            mostrarMensaje(`🚫 ${data.message}`);
        }

    } catch (error) {
        console.error('❌ Error en registro:', error);
        mostrarMensaje('🚫 Error de conexión con el servidor.');
    }
});

