console.log("✅ login.js cargado correctamente");

// Capturar elementos
const ojoPassword = document.getElementById('ojoPassword');
const iconoPassword = document.getElementById('iconoPassword');
const passwordField = document.getElementById('password');
const emailField = document.getElementById('email');
const formLogin = document.getElementById('sign-In');

// Elementos para mensajes de error específicos LOGIN
const errorEmailMessage = document.getElementById('errorEmail');
const errorPasswordMessage = document.getElementById('errorPassword');

// --- ELEMENTOS DEL FORMULARIO DE REGISTRO ---
const formRegister = document.getElementById('sign-Up');
const nameField = document.getElementById('name');
const apPaternoField = document.getElementById('Ap_paterno');
const apMaternoField = document.getElementById('Ap_materno');
const carnetField = document.getElementById('Carnet_i');
const fechaNacimientoField = document.getElementById('Fecha_nacimiento');
const emailRegisterField = document.getElementById('email-register');
const telefonoField = document.getElementById('telefono');
const ciudadField = document.getElementById('ciudad');
const zonaField = document.getElementById('Zona');
const calleField = document.getElementById('Calle');
const puertaField = document.getElementById('Puerta');
const usuarioRegisterField = document.getElementById('Usuario');
const passwordRegisterField = document.getElementById('password-register');
const ojoPasswordRegister = document.getElementById('ojoPasswordRegister');
const iconoPasswordRegister = document.getElementById('iconoPasswordRegister');

// Mensajes de error REGISTRO
const errorNameMessage = document.getElementById('errorName');
const errorApPaternoMessage = document.getElementById('errorApPaterno');
const errorApMaternoMessage = document.getElementById('errorApMaterno');
const errorCarnetIMessage = document.getElementById('errorCarnetI');
const errorFechaNacimientoMessage = document.getElementById('errorFechaNacimiento');
const errorEmailRegisterMessage = document.getElementById('errorEmailRegister');
const errorTelefonoMessage = document.getElementById('errorTelefono');
const errorCiudadMessage = document.getElementById('errorCiudad');
const errorZonaMessage = document.getElementById('errorZona');
const errorCalleMessage = document.getElementById('errorCalle');
const errorPuertaMessage = document.getElementById('errorPuerta');
const errorUsuarioMessage = document.getElementById('errorUsuario');
const errorPasswordRegisterMessage = document.getElementById('errorPasswordRegister');

// Función para mostrar/ocultar contraseña LOGIN
if (ojoPassword && passwordField && iconoPassword) {
    ojoPassword.addEventListener('click', function () {
        const isPasswordVisible = passwordField.type === 'text';
        passwordField.type = isPasswordVisible ? 'password' : 'text';
        iconoPassword.src = isPasswordVisible ? 'img/ojocerrado.png' : 'img/ojoabierto.png';
    });
} else {
    console.warn("Elementos de toggle de contraseña para LOGIN no encontrados.");
}

// Función para mostrar/ocultar contraseña REGISTRO
if (ojoPasswordRegister && passwordRegisterField && iconoPasswordRegister) {
    ojoPasswordRegister.addEventListener('click', function () {
        const isPasswordVisible = passwordRegisterField.type === 'text';
        passwordRegisterField.type = isPasswordVisible ? 'password' : 'text';
        iconoPasswordRegister.src = isPasswordVisible ? 'img/ojocerrado.png' : 'img/ojoabierto.png';
    });
} else {
    console.warn("Elementos de toggle de contraseña para REGISTRO no encontrados.");
}

// Función para mostrar mensajes generales (como los de la API)
function mostrarMensajeGeneral(texto, tipo = 'error') {
    let mensaje = document.getElementById('mensajeGeneral'); // Usar un ID diferente para no colisionar
    if (!mensaje) {
        mensaje = document.createElement('div');
        mensaje.id = 'mensajeGeneral';
        mensaje.style.padding = '10px';
        mensaje.style.margin = '10px 0';
        mensaje.style.borderRadius = '0.4rem';
        mensaje.style.fontWeight = '500';
        mensaje.style.textAlign = 'center';
        mensaje.style.transition = 'opacity 0.5s ease, display 0.5s ease';
        // Insertar antes del botón de submit o en un lugar visible
        formLogin.insertBefore(mensaje, formLogin.querySelector('button[type="submit"]')); 
    }

    mensaje.className = ''; // Limpiar clases previas
    if (tipo === 'success') {
        mensaje.style.color = '#155724'; // Verde oscuro
        mensaje.style.backgroundColor = '#D4EDDA'; // Verde claro
        mensaje.style.borderColor = '#C3E6CB';
    } else {
        mensaje.style.color = '#721C24'; // Rojo oscuro
        mensaje.style.backgroundColor = '#F8D7DA'; // Rojo claro
        mensaje.style.borderColor = '#F5C6CB';
    }
    mensaje.style.border = '1px solid';
    mensaje.textContent = texto;
    mensaje.style.display = 'block';
    mensaje.style.opacity = '1';

    setTimeout(() => {
        mensaje.style.opacity = '0';
        setTimeout(() => {
            if(mensaje) mensaje.style.display = 'none';
        }, 500);
    }, 4000);
}

// Validación y envío del formulario LOGIN
if (formLogin) {
    formLogin.addEventListener('submit', async function(event) {
        event.preventDefault();
        let isValid = true;

        // Validar campo de email/usuario
        if (emailField.value.trim() === '') {
            emailField.classList.add('input-error');
            errorEmailMessage.textContent = 'Por favor, ingresa tu correo o nombre de usuario.';
            errorEmailMessage.classList.add('active');
            isValid = false;
        } else {
            emailField.classList.remove('input-error');
            errorEmailMessage.classList.remove('active');
        }

        // Validar campo de contraseña
        if (passwordField.value.trim() === '') {
            passwordField.classList.add('input-error');
            errorPasswordMessage.textContent = 'Por favor, ingresa tu contraseña.';
            errorPasswordMessage.classList.add('active');
            isValid = false;
        } else if (passwordField.value.trim().length < 6) {
            passwordField.classList.add('input-error');
            errorPasswordMessage.textContent = 'La contraseña debe tener mínimo 6 caracteres.';
            errorPasswordMessage.classList.add('active');
            isValid = false;
        } else {
            passwordField.classList.remove('input-error');
            errorPasswordMessage.classList.remove('active');
        }

        if (!isValid) {
            return; 
        }

        const usuarioEntrada = emailField.value.trim();
        const passwordEntrada = passwordField.value.trim();

        try {
            const response = await fetch('http://dreamdressv2.test/backend/api/login_api.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    usuario: usuarioEntrada,
                    contrasena: passwordEntrada
                })
            });

            const responseData = await response.json(); // Leer el JSON una sola vez

            if (!response.ok) {
                // Usar el mensaje del servidor si está disponible, sino el statusText
                const errorMessage = responseData.message || response.statusText || `Error HTTP: ${response.status}`;
                throw new Error(errorMessage);
            }

            if (responseData.status === 'success') {
                const u = responseData.usuario;
                localStorage.setItem('usuario_id', u.usuario_id);
                localStorage.setItem('token', u.token);
                localStorage.setItem('rol_id', u.rol_id);
            
                mostrarMensajeGeneral('✅ ¡Bienvenido!', 'success');
                setTimeout(() => {
                    switch (String(u.rol_id)) {
                        case '1': window.location.href = '../admin/superadmin_menu.html'; break;
                        case '2': window.location.href = '../admin/owner_menu.html'; break;
                        case '3': window.location.href = '../inventario/menu_inventario.html'; break;
                        case '4': window.location.href = '../ventas/menu_ventas.html'; break;
                        case '5': window.location.href = '../main_menu/index.html'; break;
                        default:
                            mostrarMensajeGeneral('⚠️ Rol no reconocido. Contacta al administrador.');
                            break;
                    }
                }, 1500);
            } else {
                mostrarMensajeGeneral(`🚫 ${responseData.message || 'Error desconocido en el login.'}`);
            }

        } catch (error) {
            console.error("❌ Error en login:", error);
            mostrarMensajeGeneral(`🚫 ${error.message || 'Error de conexión con el servidor.'}`);
        }
    });
} else {
    console.warn("Formulario de LOGIN no encontrado.");
}


// --- VALIDACIÓN Y ENVÍO DEL FORMULARIO DE REGISTRO ---
if (formRegister) {
    formRegister.addEventListener('submit', async function(event) {
        event.preventDefault();
        let isValid = true;

        // Helper function para validación de campos de texto requeridos
        function validateRequiredField(field, errorMessageElement, message) {
            if (field.value.trim() === '') {
                field.classList.add('input-error');
                errorMessageElement.textContent = message;
                errorMessageElement.classList.add('active');
                return false;
            } else {
                field.classList.remove('input-error');
                errorMessageElement.classList.remove('active');
                return true;
            }
        }

        // Validaciones
        isValid = validateRequiredField(nameField, errorNameMessage, 'El nombre es requerido.') && isValid;
        isValid = validateRequiredField(apPaternoField, errorApPaternoMessage, 'El apellido paterno es requerido.') && isValid;
        isValid = validateRequiredField(apMaternoField, errorApMaternoMessage, 'El apellido materno es requerido.') && isValid;
        isValid = validateRequiredField(carnetField, errorCarnetIMessage, 'El carnet de identidad es requerido.') && isValid;
        isValid = validateRequiredField(fechaNacimientoField, errorFechaNacimientoMessage, 'La fecha de nacimiento es requerida.') && isValid;
        isValid = validateRequiredField(ciudadField, errorCiudadMessage, 'La ciudad es requerida.') && isValid;
        isValid = validateRequiredField(zonaField, errorZonaMessage, 'La zona es requerida.') && isValid;
        isValid = validateRequiredField(calleField, errorCalleMessage, 'La calle es requerida.') && isValid;
        isValid = validateRequiredField(puertaField, errorPuertaMessage, 'El número de puerta es requerido.') && isValid;
        isValid = validateRequiredField(usuarioRegisterField, errorUsuarioMessage, 'El nombre de usuario es requerido.') && isValid;

        // Validación Email
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (emailRegisterField.value.trim() === '') {
            emailRegisterField.classList.add('input-error');
            errorEmailRegisterMessage.textContent = 'El correo electrónico es requerido.';
            errorEmailRegisterMessage.classList.add('active');
            isValid = false;
        } else if (!emailRegex.test(emailRegisterField.value.trim())) {
            emailRegisterField.classList.add('input-error');
            errorEmailRegisterMessage.textContent = 'Ingresa un correo electrónico válido.';
            errorEmailRegisterMessage.classList.add('active');
            isValid = false;
        } else {
            emailRegisterField.classList.remove('input-error');
            errorEmailRegisterMessage.classList.remove('active');
        }

        // Validación Teléfono (simple, solo verifica que no esté vacío)
        // Puedes añadir regex más compleja si es necesario: /^[0-9]{7,15}$/ por ejemplo
        if (telefonoField.value.trim() === '') {
            telefonoField.classList.add('input-error');
            errorTelefonoMessage.textContent = 'El número de celular es requerido.';
            errorTelefonoMessage.classList.add('active');
            isValid = false;
        } else {
            telefonoField.classList.remove('input-error');
            errorTelefonoMessage.classList.remove('active');
        }

        // Validación Contraseña Registro
        const passwordRegValue = passwordRegisterField.value.trim();
        if (passwordRegValue === '') {
            passwordRegisterField.classList.add('input-error');
            errorPasswordRegisterMessage.textContent = 'La contraseña es requerida.';
            errorPasswordRegisterMessage.classList.add('active');
            isValid = false;
        } else if (passwordRegValue.length < 5) { // Mínimo 5 caracteres según placeholder
            passwordRegisterField.classList.add('input-error');
            errorPasswordRegisterMessage.textContent = 'La contraseña debe tener al menos 5 caracteres.';
            errorPasswordRegisterMessage.classList.add('active');
            isValid = false;
        } else {
            passwordRegisterField.classList.remove('input-error');
            errorPasswordRegisterMessage.classList.remove('active');
        }

        if (!isValid) {
            mostrarMensajeGeneral('❌ Por favor corrige los campos marcados.');
            return;
        }

        // Si todo es válido, preparar datos para enviar
        const formData = {
            nombre: nameField.value.trim(),
            ap_paterno: apPaternoField.value.trim(),
            ap_materno: apMaternoField.value.trim(),
            carnet_i: carnetField.value.trim(),
            fecha_nacimiento: fechaNacimientoField.value, // El tipo date no necesita trim
            email: emailRegisterField.value.trim(),
            telefono: telefonoField.value.trim(),
            ciudad: ciudadField.value.trim(),
            zona: zonaField.value.trim(),
            calle: calleField.value.trim(),
            puerta: puertaField.value.trim(),
            nombre_usuario: usuarioRegisterField.value.trim(),
            contrasena: passwordRegisterField.value.trim() // Enviar contraseña sin hashear, el backend lo hará
        };

        try {
            const response = await fetch('http://dreamdressv2.test/backend/api/registro_api.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const responseData = await response.json();

            if (!response.ok) {
                const errorMessage = responseData.message || response.statusText || `Error HTTP: ${response.status}`;
                throw new Error(errorMessage);
            }

            if (responseData.status === 'success') {
                mostrarMensajeGeneral('✅ ¡Registro exitoso! Ahora puedes iniciar sesión.', 'success');
                // Opcional: Limpiar campos o redirigir a login
                formRegister.reset(); // Limpia el formulario
                // Aquí podrías llamar a changeSignIn() para mostrar el form de login automáticamente
                // changeSignIn(); 
            } else {
                mostrarMensajeGeneral(`🚫 ${responseData.message || 'Error desconocido en el registro.'}`);
            }

        } catch (error) {
            console.error("❌ Error en registro:", error);
            mostrarMensajeGeneral(`🚫 ${error.message || 'Error de conexión con el servidor.'}`);
        }
    });
} else {
    console.warn("Formulario de REGISTRO no encontrado.");
}
