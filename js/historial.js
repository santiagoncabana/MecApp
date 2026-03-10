/**
 * HISTORIAL DE CITAS - Sistema de visualización de citas pasadas
 * 
 * Este archivo maneja:
 * - Carga de todas las citas del cliente
 * - Filtrado por estado (todos, finalizadas, en curso, pendientes)
 * - Visualización de estadísticas
 * - Búsqueda y presentación de datos
 */

const API_BASE = 'http://127.0.0.1:8000';

let todasLasCitas = [];
let filtroActual = 'todos';

/**
 * Inicializa la página cuando está lista
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('=== PÁGINA HISTORIAL CARGADA ===');
    
    const tipoUsuario = localStorage.getItem('userType');
    const clienteId = localStorage.getItem('clienteId');
    const clienteDni = localStorage.getItem('clienteDni');
    
    console.log('Tipo de usuario:', tipoUsuario);
    
    if (tipoUsuario !== 'cliente' || !clienteId) {
        console.log('No hay sesión de cliente válida. Redirigiendo a login...');
        alert('Debes iniciar sesión como cliente primero');
        localStorage.clear();
        window.location.href = '/MecApp/frontend/login.html';
        return;
    }

    console.log('Cliente ID:', clienteId, 'DNI:', clienteDni);
    
    // Actualizar header
    await actualizarHeaderCliente();
    
    // Configurar eventos de filtros
    configurarFiltros();
    
    // Cargar citas del cliente
    if (clienteDni) {
        await cargarHistorialCitas(clienteDni);
    }
    
    // Configurar logout
    configurarLogout();
});

/**
 * Actualiza el header con los datos del cliente
 */
async function actualizarHeaderCliente() {
    try {
        const clienteId = localStorage.getItem('clienteId');
        const clienteGuardado = JSON.parse(localStorage.getItem('cliente') || '{}');
        
        if (!clienteId) return;
        
        let nombreCliente = clienteGuardado.nombre || 'Cliente';
        
        const userNameElement = document.getElementById('userName');
        if (userNameElement) {
            userNameElement.textContent = nombreCliente;
        }
        
        const userAvatarElement = document.getElementById('userAvatar');
        if (userAvatarElement) {
            const primeraLetra = nombreCliente.charAt(0).toUpperCase();
            userAvatarElement.textContent = primeraLetra;
        }
        
    } catch (error) {
        console.error('Error al actualizar header:', error);
    }
}

/**
 * Configura los botones de filtro
 */
function configurarFiltros() {
    const botonesFiltro = document.querySelectorAll('.filtro-btn');
    
    botonesFiltro.forEach(boton => {
        boton.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remover clase active de todos
            botonesFiltro.forEach(b => b.classList.remove('active'));
            
            // Agregar clase active al clickeado
            boton.classList.add('active');
            
            // Actualizar filtro y renderizar
            filtroActual = boton.dataset.filtro;
            renderizarCitas();
        });
    });
}

/**
 * Carga el historial de citas del cliente desde la API
 * @param {string} dni - DNI del cliente
 */
async function cargarHistorialCitas(dni) {
    try {
        console.log('Cargando historial para DNI:', dni);
        
        const response = await fetch(`${API_BASE}/api/turnos/turnos/buscar/${dni}/todos`);
        
        if (!response.ok) {
            if (response.status === 404) {
                console.log('No se encontraron citas para este cliente');
                todasLasCitas = [];
                renderizarCitas();
                actualizarEstadisticas();
                return;
            }
            throw new Error('Error al cargar las citas');
        }
        
        const citas = await response.json();
        console.log('Citas cargadas:', citas);
        
        todasLasCitas = citas || [];
        renderizarCitas();
        actualizarEstadisticas();
        
    } catch (error) {
        console.error('Error cargando historial:', error);
        
        const container = document.getElementById('citasHistorialContainer');
        if (container) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>Error al cargar tu historial. Intenta nuevamente más tarde.</p>
                </div>
            `;
        }
    }
}

/**
 * Renderiza las citas según el filtro actual
 */
function renderizarCitas() {
    const container = document.getElementById('citasHistorialContainer');
    
    if (!container) return;
    
    // Filtrar citas
    let citasAMostrar = todasLasCitas;
    
    if (filtroActual !== 'todos') {
        citasAMostrar = todasLasCitas.filter(cita => cita.estado === filtroActual);
    }
    
    // Si no hay citas
    if (citasAMostrar.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>No hay citas ${filtroActual !== 'todos' ? 'con estado ' + filtroActual : ''}</p>
            </div>
        `;
        return;
    }
    
    // Crear tarjetas de citas
    container.innerHTML = citasAMostrar
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha)) // Ordenar por fecha descendente
        .map(cita => crearTarjetaCita(cita))
        .join('');
}

/**
 * Crea el HTML de una tarjeta de cita
 * @param {Object} cita - Objeto de cita
 * @returns {string} HTML de la tarjeta
 */
function crearTarjetaCita(cita) {
    const nodbreCliente = cita.cliente?.nombre || 'Cliente desconocido';
    const telefonoCliente = cita.cliente?.telefono || cita.telefono || 'N/A';
    const dniCliente = cita.cliente?.DNI || cita.DNI || 'N/A';
    const empleadoNombre = cita.empleado?.nombre || 'Sin asignar';
    const estado = cita.estado || 'desconocido';
    const estadoLabel = estado.charAt(0).toUpperCase() + estado.slice(1);
    
    // Formatear fecha
    const fechaObj = new Date(cita.fecha);
    const fechaFormato = fechaObj.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Información de orden si existe
    const ordenInfo = cita.orden_servicio 
        ? `<div class="cita-dato">
            <span class="cita-label">Orden de Servicio</span>
            <strong>✅ Orden #${cita.orden_servicio.id}</strong>
        </div>`
        : '';
    
    return `
        <div class="cita-card ${estado}">
            <div class="cita-info">
                <div class="cita-header">
                    <div class="cita-fecha">${fechaFormato}</div>
                    <div class="cita-hora">🕐 ${cita.hora || 'Sin hora'}</div>
                </div>
                
                <div class="cita-datos">
                    <div class="cita-dato">
                        <span class="cita-label">Cliente</span>
                        <strong>${nodbreCliente}</strong>
                    </div>
                    <div class="cita-dato">
                        <span class="cita-label">DNI</span>
                        <strong>${dniCliente}</strong>
                    </div>
                    <div class="cita-dato">
                        <span class="cita-label">Teléfono</span>
                        <strong>${telefonoCliente}</strong>
                    </div>
                    <div class="cita-dato">
                        <span class="cita-label">Empleado Asignado</span>
                        <strong>${empleadoNombre}</strong>
                    </div>
                    ${ordenInfo}
                </div>
            </div>
            
            <div class="cita-status ${estado}">
                ${estadoLabel}
            </div>
        </div>
    `;
}

/**
 * Actualiza las estadísticas mostradas
 */
function actualizarEstadisticas() {
    const totalElement = document.getElementById('totalCitas');
    const finalizadasElement = document.getElementById('citasFinalizadas');
    const enCursoElement = document.getElementById('citasEnCurso');
    
    const total = todasLasCitas.length;
    const finalizadas = todasLasCitas.filter(c => c.estado === 'finalizado').length;
    const enCurso = todasLasCitas.filter(c => c.estado === 'en_curso').length;
    
    if (totalElement) totalElement.textContent = total;
    if (finalizadasElement) finalizadasElement.textContent = finalizadas;
    if (enCursoElement) enCursoElement.textContent = enCurso;
}

/**
 * Configura el botón de logout
 */
function configurarLogout() {
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = '/MecApp/frontend/login.html';
        });
    }
}
