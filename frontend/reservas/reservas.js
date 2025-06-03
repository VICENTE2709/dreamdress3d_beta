document.addEventListener('DOMContentLoaded', function() {
    console.log('reservas.js cargado y DOM listo para calendario personalizado');

    // --- REFERENCIAS A ELEMENTOS DEL DOM --- 
    const calendarGrid = document.getElementById('calendar-grid');
    const monthSelect = document.getElementById('month-select');
    const yearSelect = document.getElementById('year-select');
    const prevMonthBtn = document.getElementById('prev-month-btn');
    const nextMonthBtn = document.getElementById('next-month-btn');

    const horariosDisponiblesContainer = document.getElementById('horarios-disponibles');
    const mensajeHorarios = document.getElementById('mensaje-horarios');
    const formReserva = document.getElementById('form-reserva');
    // const nombreClienteInput = document.getElementById('nombreCliente'); // Eliminado
    // const telefonoClienteInput = document.getElementById('telefonoCliente'); // Eliminado
    // const emailClienteInput = document.getElementById('emailCliente'); // Eliminado
    const comentariosInput = document.getElementById('comentarios');
    const fechaSeleccionadaSpan = document.getElementById('fecha-seleccionada-confirmacion');
    const horaSeleccionadaSpan = document.getElementById('hora-seleccionada-confirmacion');

    let fechaSeleccionada = null;
    let horaSeleccionada = null;
    let currentDate = new Date(); // Usaremos esto para controlar el mes y año actual

    // --- LÓGICA DEL CALENDARIO PERSONALIZADO ---
    function renderCalendar() {

        if (!calendarGrid || !monthSelect || !yearSelect || !prevMonthBtn || !nextMonthBtn) {
            console.error('Faltan elementos del DOM para el calendario personalizado.');
            // Loguear el estado específico cuando la condición falla:
            console.log('Estado de los elementos CUANDO FALLA la comprobación en renderCalendar:');
            console.log('  calendarGrid:', calendarGrid);
            console.log('  monthSelect:', monthSelect);
            console.log('  yearSelect:', yearSelect);
            console.log('  prevMonthBtn:', prevMonthBtn);
            console.log('  nextMonthBtn:', nextMonthBtn);
            console.error('Faltan elementos del DOM para el calendario personalizado.');
            return;
        }

        calendarGrid.innerHTML = ''; // Limpiar calendario anterior
        const month = currentDate.getMonth();
        const year = currentDate.getFullYear();

        // monthYearDisplay.textContent = `${currentDate.toLocaleDateString('es-ES', { month: 'long' })} ${year}`;
        // Esta línea ya no es necesaria ya que usamos selects.
        // Aseguramos que los selects muestren el mes y año correctos.
        monthSelect.value = month;
        yearSelect.value = year;

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const daysInMonth = lastDayOfMonth.getDate();
        const startingDay = (firstDayOfMonth.getDay() + 6) % 7; // 0 (Lunes) a 6 (Domingo)

        // Encabezados de los días de la semana (L, M, X, J, V, S, D)
        const dayHeaders = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
        dayHeaders.forEach(header => {
            const dayHeaderEl = document.createElement('div');
            dayHeaderEl.classList.add('calendar-day-header');
            dayHeaderEl.textContent = header;
            calendarGrid.appendChild(dayHeaderEl);
        });

        // Espacios en blanco para los días antes del inicio del mes
        for (let i = 0; i < startingDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.classList.add('calendar-day', 'empty');
            calendarGrid.appendChild(emptyCell);
        }

        // Días del mes
        for (let day = 1; day <= daysInMonth; day++) {
            const dayCell = document.createElement('div');
            dayCell.classList.add('calendar-day');
            dayCell.textContent = day;
            dayCell.dataset.date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

            const today = new Date();
            if (year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
                dayCell.classList.add('today');
            }
            if (fechaSeleccionada && fechaSeleccionada === dayCell.dataset.date) {
                dayCell.classList.add('selected');
            }

            dayCell.addEventListener('click', function() {
                if (fechaSeleccionada) {
                    const prevSelected = calendarGrid.querySelector('.calendar-day.selected');
                    if (prevSelected) prevSelected.classList.remove('selected');
                }
                fechaSeleccionada = this.dataset.date;
                this.classList.add('selected');
                console.log('Fecha seleccionada:', fechaSeleccionada);
                fechaSeleccionadaSpan.textContent = fechaSeleccionada; // Actualizar confirmación
                // Aquí llamarías a la función para cargar horarios para la fechaSeleccionada
                cargarHorariosParaFecha(fechaSeleccionada);
            });
            calendarGrid.appendChild(dayCell);
        }
    }

    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    // --- LÓGICA DE HORARIOS Y RESERVA (Simplificada/Adaptada) ---
    function cargarHorariosParaFecha(fecha) {
        console.log(`Cargando horarios para: ${fecha}`);
        horariosDisponiblesContainer.innerHTML = ''; // Limpiar horarios anteriores
        mensajeHorarios.style.display = 'none';

        // Simulación de horarios disponibles. Reemplazar con lógica de API si es necesario.
        const horariosSimulados = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
        if (horariosSimulados.length > 0) {
            horariosSimulados.forEach(hora => {
                const btnHora = document.createElement('button');
                btnHora.classList.add('button'); 
                btnHora.textContent = hora;
                btnHora.addEventListener('click', function() {
                    if (horaSeleccionada) {
                        const prevSelectedBtn = horariosDisponiblesContainer.querySelector('.button.selected'); 
                        if (prevSelectedBtn) {
                            prevSelectedBtn.classList.remove('selected');
                        }
                    }
                    horaSeleccionada = hora;
                    this.classList.add('selected'); 
                    console.log('Hora seleccionada:', horaSeleccionada);
                    horaSeleccionadaSpan.textContent = horaSeleccionada; // Actualizar confirmación
                    formReserva.style.display = 'block';
                });
                horariosDisponiblesContainer.appendChild(btnHora);
            });
        } else {
            mensajeHorarios.textContent = 'No hay horarios disponibles para esta fecha.';
            mensajeHorarios.style.display = 'block';
            formReserva.style.display = 'none';
        }
    }

    formReserva.addEventListener('submit', function(event) {
        event.preventDefault();
        console.log('Formulario de reserva enviado');
        const datosReserva = {
            // ClienteID se obtendrá del lado del servidor desde la sesión PHP.
            fecha: fechaSeleccionada,
            hora: horaSeleccionada,
            comentarios: comentariosInput.value
            // Estado ('Pendiente') y Fecha_creacion se manejarán en el backend.
        };
        console.log('Datos de la reserva (a enviar al backend):', datosReserva);

        // Lógica para enviar los datos al backend (API)
        fetch('../../backend/api/reservas/crear_reserva.php', { // Ajusta esta ruta si es necesario
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // El token/sesión PHP se maneja automáticamente con las cookies si está en el mismo dominio.
            },
            body: JSON.stringify(datosReserva)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(data.message || 'Reserva creada exitosamente.');
                // Limpiar formulario y selecciones
                formReserva.reset();
                fechaSeleccionada = null;
                horaSeleccionada = null;
                fechaSeleccionadaSpan.textContent = 'N/A';
                horaSeleccionadaSpan.textContent = 'N/A';
                horariosDisponiblesContainer.innerHTML = '';
                mensajeHorarios.textContent = 'Por favor, selecciona primero una fecha.';
                mensajeHorarios.style.display = 'block';
                formReserva.style.display = 'none';
                const selectedDay = calendarGrid.querySelector('.calendar-day.selected');
                if (selectedDay) selectedDay.classList.remove('selected');
            } else {
                alert('Error al crear la reserva: ' + (data.message || 'Error desconocido.'));
                if (data.redirect) { // Si el backend indica redirección (ej. por falta de auth)
                    window.location.href = data.redirect;
                }
            }
        })
        .catch(error => {
            console.error('Error al enviar la reserva:', error);
            alert('Error de conexión al intentar crear la reserva. Por favor, inténtalo de nuevo.');
        });
        fechaSeleccionada = null;
        horaSeleccionada = null;
        fechaSeleccionadaSpan.textContent = 'N/A';
        horaSeleccionadaSpan.textContent = 'N/A';
        horariosDisponiblesContainer.innerHTML = '';
        mensajeHorarios.textContent = 'Por favor, selecciona primero una fecha.';
        mensajeHorarios.style.display = 'block';
        formReserva.style.display = 'none';
        const selectedDay = calendarGrid.querySelector('.calendar-day.selected');
        if (selectedDay) selectedDay.classList.remove('selected');
    });

    function populateMonthSelect() {
        const months = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        months.forEach((month, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = month;
            monthSelect.appendChild(option);
        });
    }

    function populateYearSelect() {
        const currentYear = new Date().getFullYear();
        for (let year = currentYear - 2; year <= currentYear + 7; year++) { // Rango de años (ej. 2023 a 2030)
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        }
    }

    monthSelect.addEventListener('change', () => {
        currentDate.setMonth(parseInt(monthSelect.value));
        currentDate.setFullYear(parseInt(yearSelect.value)); // Asegurar que el año también se actualice
        renderCalendar();
    });

    yearSelect.addEventListener('change', () => {
        currentDate.setFullYear(parseInt(yearSelect.value));
        currentDate.setMonth(parseInt(monthSelect.value)); // Asegurar que el mes también se actualice
        renderCalendar();
    });


    // --- LÓGICA DE AUTENTICACIÓN ---
    function verificarAutenticacionYRedirigir() {
        // Ajusta la ruta a tu endpoint real de verificación de sesión PHP
        fetch('http://dreamdressv2.test/backend/api/auth/verificar_sesion.php', {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                // Si la respuesta no es OK (ej. 401, 403, 500), asumir no autenticado o error.
                console.warn('Respuesta no OK del servidor de autenticación. Estado:', response.status);
                // Redirigir a una página de login por defecto. Ajusta esta URL.
                window.location.href = 'http://dreamdressv2.test/frontend/login/login.html'; 
                throw new Error('Respuesta no OK del servidor de autenticación');
            }
            return response.json();
        })
        .then(data => {
            if (data.autenticado) {
                console.log('Usuario autenticado.');
                // Opcional: Mostrar nombre de usuario si tienes un elemento para ello.
                // if (data.nombreUsuario && document.getElementById('display-nombre-usuario')) {
                //     document.getElementById('display-nombre-usuario').textContent = `Bienvenido, ${data.nombreUsuario}`;
                // }
            } else {
                console.log('Usuario no autenticado. Redirigiendo...');
                // El backend debería proporcionar la URL de redirección o usar una por defecto.
                // Ajusta la URL de login/registro según tu estructura.
                window.location.href = data.redirectUrl || 'http://dreamdressv2.test/frontend/login/login.html'; 
            }
        })
        .catch(error => {
            console.error('Error crítico al verificar autenticación:', error);
            // En caso de error de red o JSON inválido, redirigir por seguridad.
            alert('Error al verificar tu sesión. Serás redirigido para iniciar sesión.');
            // Ajusta la URL de login/registro según tu estructura.
            window.location.href = 'http://dreamdressv2.test/frontend/login/login.html'; 
        });
    }

    // Llamar a la verificación de autenticación ANTES de inicializar el calendario
    verificarAutenticacionYRedirigir();

    // Inicializar calendario al cargar la página (después de la verificación de auth)
    populateMonthSelect();
    populateYearSelect();
    renderCalendar();
});
