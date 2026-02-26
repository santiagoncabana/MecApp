// URL de tu API de FastAPI. Asegúrate de que el puerto sea el correcto (ej. 8000)
const API_BASE_URL = 'http://localhost:8000';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Cargar las citas pendientes al inicio
    cargarCitasPendientes();
    
    // 2. Llama a la función de estadísticas aquí para que se ejecute al cargar
    cargarEstadisticasDashboard();
});


async function cargarEstadisticasDashboard() {
    const endpoint = `${API_BASE_URL}/api/turnos/dashboard/stats`;
    const selectorCitas = document.querySelector('.stats-grid .stat-card:nth-child(1) .stat-number');
    const selectorClientes = document.querySelector('.stats-grid .stat-card:nth-child(2) .stat-number');
    const selectorVehiculos = document.querySelector('.stats-grid .stat-card:nth-child(3) .stat-number');
    const selectorIngresos = document.querySelector('.stats-grid .stat-card:nth-child(4) .stat-number');

    // Muestra un indicador de carga mientras espera
    selectorCitas.textContent = '...';
    selectorClientes.textContent = '...';
    selectorVehiculos.textContent = '...';
    selectorIngresos.textContent = 'Cargando...'; 

    try {
        const response = await fetch(endpoint);
        if (!response.ok) {
             console.error(`Error ${response.status} al cargar estadísticas.`);
             // Si falla, volvemos a mostrar el valor de placeholder
             selectorCitas.textContent = '5'; 
             selectorClientes.textContent = '24';
             selectorVehiculos.textContent = '3';
             selectorIngresos.textContent = '$2,450';
             return;
        }

        const stats = await response.json(); // Esperamos el objeto DashboardStats
        
        // Actualizar el DOM con los valores reales
        selectorCitas.textContent = stats.citas_hoy;
        selectorClientes.textContent = stats.clientes_activos;
        selectorVehiculos.textContent = stats.vehiculos_en_taller;
        // Formatear el ingreso a moneda (asumiendo USD/ARS para el ejemplo)
        selectorIngresos.textContent = `$${stats.ingresos_mensuales.toFixed(2)}`; 
        

    } catch (error) {
        console.error("Fallo general al cargar estadísticas:", error);
        // Si falla, volvemos a mostrar el valor de placeholder
        selectorCitas.textContent = '5'; 
        selectorClientes.textContent = '24';
        selectorVehiculos.textContent = '3';
        selectorIngresos.textContent = '$2,450';
    }
}
/**
 * Función para hacer la petición al backend y obtener los turnos pendientes.
 */
async function cargarCitasPendientes() {
    const contenedorCitas = document.querySelector('.appointments-list');
    contenedorCitas.innerHTML = '<p class="loading-message">Cargando citas...</p>';

    // Endpoint: /api/turnos/pendientes (Debe traer solo los pendientes desde el backend)
    const endpoint = `${API_BASE_URL}/api/turnos/pendientes`;

    try {
        const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        // Manejar errores de HTTP (ej. 404, 500)
        if (!response.ok) {
            const errorData = await response.json(); 
            throw new Error(`Error ${response.status}: ${errorData.detail || response.statusText}`);
        }

        const citasPendientes = await response.json();
        
        // Ya no filtramos aquí, confiamos en que el backend solo devuelve pendientes.
        
        // Limpiar el mensaje de carga
        contenedorCitas.innerHTML = ''; 

        if (citasPendientes.length === 0) {
            contenedorCitas.innerHTML = '<p class="no-citas-message">No hay citas pendientes hoy.</p>';
            return;
        }

        // 2. Renderizar las citas
        citasPendientes.forEach(cita => {
            const card = crearTarjetaCita(cita);
            contenedorCitas.appendChild(card);
        });

    } catch (error) {
        console.error("Error al cargar las citas:", error);
        contenedorCitas.innerHTML = `<p class="error-message">Fallo al conectar con el servidor: ${error.message}</p>`;
    }
}

/**
 * Crea el elemento HTML de la tarjeta de cita.
 * @param {Object} cita - Objeto de turno recibido del backend.
 * @returns {HTMLElement} La tarjeta de cita creada.
 */
function crearTarjetaCita(cita) {
    const card = document.createElement('div');
    card.className = 'appointment-card';
    
    // Usamos 'id' de la respuesta JSON para el atributo de datos
    card.setAttribute('data-id', cita.id); 

   
const turnoID = cita.id || 'N/A';
    const cliente_id = cita.cliente_id || 'N/A';
    const empleado_id = cita.empleado_id || 'N/A';
    const fecha = cita.fecha || 'N/A';
    const hora = cita.hora || 'N/A';
    const estado = cita.estado || 'error';


    
    // El HTML interno de la tarjeta (usando la estructura de tu dashboard)
    card.innerHTML = `
        <div class="card-details">
            <span class="turno_id"> TurnoID: ${turnoID}</span>
            <span class="cliente_id_info">Cliente: ${cliente_id}</span>
            <span class="empleado_id_info">Empleado: ${empleado_id}</span>
            <span class="fecha-info">Fecha: ${fecha}</span>
            <span class="hora-info">Hora ${hora}</span>
            <span class="estado-info">Estado: (${estado})</span>
        </div>
        <div class="card-actions">
            <!-- Botón para Iniciar/Ver detalles -->
            <button class="action-btn start-btn" data-turno-id="${cita.id}">
                <i class="fas fa-play"></i> Confirmar
            </button>
            <button class="action-btn editar-btn" data-turno-id="${cita.id}">
                <i class="fas fa-play"></i> Editar
            </button>
        </div>
    `;

    return card;
}









// ----------------------------------------------------------




document.addEventListener("click", function (event) {
    const btn = event.target.closest(".start-btn");
    if (btn) {
        const card = btn.closest(".appointment-card");
        const turnoId = card.dataset.id;
        console.log("Turno ID:", turnoId);

        confirmarLlegada(turnoId, btn);
    }
});


async function confirmarLlegada(turnoId) {
    console.log(`Intentando confirmar Turno ID: ${turnoId}`);
    
    // --- CORRECCIÓN DE URL CLAVE AQUÍ ---
    // El router en backend declara: @router.put("/turnos/{turno_id}/confirmar-llegada")
    // con prefix "/api/turnos" => ruta final: /api/turnos/turnos/{turno_id}/confirmar-llegada
    const endpoint = `${API_BASE_URL}/api/turnos/turnos/${turnoId}/confirmar-llegada`;

    try {
        const response = await fetch(endpoint, {
            method: 'PUT', // Usamos PUT para actualizar un recurso existente
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        if (!response.ok) {
            // Si el backend envía un detalle de error (ej. 404, 400)
            const errorText = await response.text(); 
            throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
        }

        const result = await response.json();
        console.log("Confirmación exitosa:", result);

        // Ocultar la tarjeta y actualizar contadores
        const card = document.querySelector(`.appointment-card[data-id="${turnoId}"]`);
        if (card) {
            card.remove(); 
        }

        // Vuelve a cargar el dashboard para actualizar los contadores
        cargarEstadisticasDashboard(); 

    } catch (error) {
        console.error(`Fallo al confirmar turno ${turnoId}:`, error);
        alert(`Error al confirmar turno ${turnoId}: ${error.message}`); 
    }
}


// --- AGREGAR MANEJADOR DE EVENTOS (Reemplaza o verifica esta sección en tu JS) ---

// document.addEventListener('click', (event) => {
//     // Escucha clics en cualquier botón con la clase .confirm-btn
//     if (event.target.closest('.confirm-btn')) {
//         const button = event.target.closest('.confirm-btn');
//         const turnoId = button.getAttribute('data-turno-id');
        
//         if (turnoId) {
//             // El estado pasa de Pendiente a En Curso
//             confirmarLlegada(parseInt(turnoId)); 
//         }
//     }
// });