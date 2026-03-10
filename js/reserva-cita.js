/**
 * RESERVA DE CITA - Manejo del modal y formulario de reserva
 * 
 * Este archivo maneja:
 * - Apertura y cierre del modal de reserva
 * - Validación del formulario
 * - Envío de datos al servidor
 * - Manejo de respuestas y errores
 */



/**
 * Inicializa el modal y los event listeners cuando la página carga
 */
document.addEventListener('DOMContentLoaded', () => {
    inicializarModalReserva();
});

/**
 * Configura todos los eventos del modal de reserva de cita
 */
function inicializarModalReserva() {
    const btnReservar = document.getElementById('btnReservarCita');
    const btnCerrar = document.getElementById('btnCerrarModal');
    const btnCancelar = document.getElementById('btnCancelarReserva');
    const modal = document.getElementById('modalReservaEita');
    const formReserva = document.getElementById('formReservaCita');
    const inputDNI = document.getElementById('inputDNI');

    // Abrir modal
    if (btnReservar) {
        btnReservar.addEventListener('click', (e) => {
            e.preventDefault();
            abrirModalReserva();
        });
    }

    // Cerrar modal con botón X
    if (btnCerrar) {
        btnCerrar.addEventListener('click', () => {
            cerrarModalReserva();
        });
    }

    // Cerrar modal con botón Cancelar
    if (btnCancelar) {
        btnCancelar.addEventListener('click', () => {
            cerrarModalReserva();
        });
    }

    // Cerrar modal al hacer clic fuera del contenido
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                cerrarModalReserva();
            }
        });
    }

    // Enviar formulario
    if (formReserva) {
        formReserva.addEventListener('submit', (e) => {
            e.preventDefault();
            enviarReservaCita();
        });
    }

    // Prellenar DNI desde localStorage si existe
    if (inputDNI) {
        const dniGuardado = localStorage.getItem('clienteDni');
        if (dniGuardado) {
            inputDNI.value = dniGuardado;
        }
    }

    // Establecer fecha mínima en today
    const inputFecha = document.getElementById('inputFecha');
    if (inputFecha) {
        const today = new Date().toISOString().split('T')[0];
        inputFecha.min = today;
    }
}

/**
 * Abre el modal de reserva de cita
 */
function abrirModalReserva() {
    const modal = document.getElementById('modalReservaEita');
    if (modal) {
        modal.classList.add('active');
        // Opcional: Hacer scroll hacia arriba
        window.scrollTo(0, 0);
    }
}

/**
 * Cierra el modal de reserva de cita
 */
function cerrarModalReserva() {
    const modal = document.getElementById('modalReservaEita');
    if (modal) {
        modal.classList.remove('active');
        // Limpiar formulario
        const formReserva = document.getElementById('formReservaCita');
        if (formReserva) {
            formReserva.reset();
        }
    }
}

/**
 * Envía los datos de la reserva al servidor
 */
async function enviarReservaCita() {
    try {
        // Obtener valores del formulario
        const telefono = document.getElementById('inputTelefono').value.trim();
        const dni = document.getElementById('inputDNI').value.trim();
        const fecha = document.getElementById('inputFecha').value;
        const hora = document.getElementById('inputHora').value;

        // Validaciones básicas
        if (!telefono || !dni || !fecha || !hora) {
            alert('Por favor, completa todos los campos');
            return;
        }

        // Validar que la hora esté en un formato válido
        if (!/^\d{2}:\d{2}$/.test(hora)) {
            alert('La hora debe estar en formato HH:MM');
            return;
        }

        console.log('Enviando reserva de cita:', { telefono, dni, fecha, hora });

        // Desactivar botón de envío
        const btnEnviar = document.querySelector('#formReservaCita button[type="submit"]');
        const btnOriginalText = btnEnviar.textContent;
        btnEnviar.disabled = true;
        btnEnviar.textContent = 'Enviando...';

        // Realizar petición POST al endpoint
        const response = await fetch(`${API_BASE}/api/turnos/CrearTurno`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                telefono: telefono,
                DNI: dni,
                fecha: fecha,
                hora: hora,
                estado: 'Pendiente'
            })
        });

        // Restaurar botón
        btnEnviar.disabled = false;
        btnEnviar.textContent = btnOriginalText;

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error en la respuesta:', errorData);
            alert('Error al crear la cita: ' + (errorData.detail || 'Error desconocido'));
            return;
        }

        const result = await response.json();
        console.log('Cita creada exitosamente:', result);

        // Mostrar mensaje de éxito
        alert('¡Cita reservada exitosamente!\nID de Turno: ' + result.turno_id);

        // Cerrar el modal
        cerrarModalReserva();

        // Opcional: Redirigir a mis citas después de un delay
        setTimeout(() => {
            window.location.href = '/MecApp/frontend/Pagues-clientes/mis-citas.html';
        }, 1500);

    } catch (error) {
        console.error('Error al enviar la reserva:', error);
        alert('Error de conexión con el servidor. Intenta nuevamente.');
        
        // Restaurar botón en caso de error
        const btnEnviar = document.querySelector('#formReservaCita button[type="submit"]');
        if (btnEnviar) {
            btnEnviar.disabled = false;
            btnEnviar.textContent = 'Enviar';
        }
    }
}

/**
 * Formatea la fecha en formato legible
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 * @returns {string} Fecha formateada
 */
function formatearFecha(fecha) {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}
