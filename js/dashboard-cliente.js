/**
 * DASHBOARD CLIENTE - Sistema Central de Gestión de Cliente
 * 
 * Este archivo maneja toda la lógica del dashboard del cliente incluyendo:
 * - Autenticación y sesión
 * - Carga de datos del cliente (nombre, email, DNI)
 * - Próxima cita
 * - Vehículo principal
 * - Listado de todos los vehículos
 * - Listado de todas las citas
 * - Perfil del cliente
 * - Cierre de sesión
 */

const API_BASE = 'http://127.0.0.1:8000';

/**
 * FUNCIONES DE INICIALIZACIÓN Y SESIÓN
 */

/**
 * Verifica que el usuario esté autenticado al cargar la página.
 * Si no hay sesión válida, redirige al login.
 */
window.addEventListener('DOMContentLoaded', async () => {
    console.log('=== PÁGINA CARGADA ===');
    
    const clienteId = localStorage.getItem('clienteId');
    console.log('Cliente ID encontrado:', clienteId);
    
    if (!clienteId) {
        console.log('No hay sesión activa. Redirigiendo a login...');
        alert('Debes iniciar sesión primero');
        window.location.href = '/MecApp/frontend/login.html';
        return;
    }
    
    console.log('Sesión válida. Inicializando página...');
    await inicializarPagina();
});

/**
 * Inicializa la página actual cargando:
 * - Datos del cliente en el header
 * - Datos específicos según la página
 */
async function inicializarPagina() {
    try {
        // Actualizar header en todas las páginas
        await actualizarHeaderCliente();
        
        // Cargar datos específicos según la página
        const paginaActual = obtenerPaginaActual();
        console.log('Página actual:', paginaActual);
        
        switch(paginaActual) {
            case 'dashboard-cliente':
                await cargarDashboard();
                break;
            case 'mis-vehiculos':
                await cargarMisVehiculos();
                break;
            case 'mis-citas':
                await cargarMisCitas();
                break;
            case 'perfil-cliente':
                await cargarPerfilCliente();
                break;
            default:
                console.log('Página no reconocida');
        }
        
        // Configurar botón de logout
        configurarLogout();
        
    } catch (error) {
        console.error('Error al inicializar página:', error);
        alert('Error al cargar la página. Intenta nuevamente.');
    }
}

/**
 * Obtiene el nombre de la página actual basado en la URL
 * @returns {string} Nombre de la página actual
 */
function obtenerPaginaActual() {
    const url = window.location.pathname;
    if (url.includes('dashboard-cliente')) return 'dashboard-cliente';
    if (url.includes('mis-vehiculos')) return 'mis-vehiculos';
    if (url.includes('mis-citas')) return 'mis-citas';
    if (url.includes('perfil-cliente')) return 'perfil-cliente';
    return 'unknown';
}

/**
 * FUNCIONES DE HEADER Y USUARIO
 */

/**
 * Actualiza el header con el nombre del cliente en TODAS las páginas.
 * Obtiene los datos del cliente desde localStorage o del servidor.
 */
async function actualizarHeaderCliente() {
    try {
        const clienteId = localStorage.getItem('clienteId');
        const clienteGuardado = JSON.parse(localStorage.getItem('cliente') || '{}');
        
        if (!clienteId) {
            console.error('No hay clienteId en localStorage');
            return;
        }
        
        let nombreCliente = clienteGuardado.nombre || 'Cliente';
        let datosCliente = clienteGuardado;
        
        // Si no tenemos datos en localStorage, obtener del servidor
        if (!clienteGuardado.nombre) {
            console.log('Obteniendo datos del cliente desde servidor...');
            const response = await fetch(`${API_BASE}/cliente/${clienteId}`);
            
            if (response.ok) {
                datosCliente = await response.json();
                nombreCliente = datosCliente.nombre;
                
                // Guardar en localStorage para futuras cargas
                localStorage.setItem('cliente', JSON.stringify(datosCliente));
                localStorage.setItem('clienteNombre', nombreCliente);
                if (datosCliente.dni) {
                    localStorage.setItem('clienteDni', datosCliente.dni);
                }
            }
        }
        
        // Actualizar elemento username en header
        const userNameElement = document.getElementById('userName');
        if (userNameElement) {
            userNameElement.textContent = nombreCliente;
            console.log('Header actualizado con nombre:', nombreCliente);
        }
        
        // Actualizar avatar con primera letra del nombre
        const userAvatarElement = document.getElementById('userAvatar');
        if (userAvatarElement) {
            const primeraLetra = nombreCliente.charAt(0).toUpperCase();
            userAvatarElement.textContent = primeraLetra;
        }
        
        return datosCliente;
        
    } catch (error) {
        console.error('Error al actualizar header:', error);
        
        // Fallback: usar nombre de localStorage
        const nombreFallback = localStorage.getItem('clienteNombre') || 'Cliente';
        const userNameElement = document.getElementById('userName');
        if (userNameElement) {
            userNameElement.textContent = nombreFallback;
        }
    }
}

/**
 * FUNCIONES DEL DASHBOARD PRINCIPAL
 */

/**
 * Carga todos los datos del dashboard principal:
 * - Próxima cita
 * - Vehículo principal
 */
async function cargarDashboard() {
    console.log('=== CARGANDO DASHBOARD ===');
    
    try {
        const clienteId = localStorage.getItem('clienteId');
        const clienteDni = localStorage.getItem('clienteDni');
        
        if (!clienteId) {
            console.error('No hay clienteId');
            return;
        }
        
        // Obtener datos del cliente
        const response = await fetch(`${API_BASE}/cliente/${clienteId}`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const cliente = await response.json();
        console.log('Datos del cliente:', cliente);
        
        // Actualizar título de bienvenida
        const welcomeTitle = document.querySelector('.h-title');
        if (welcomeTitle) {
            welcomeTitle.textContent = `Bienvenido, ${cliente.nombre}`;
        }
        
        // Cargar próxima cita si tenemos DNI
        if (cliente.dni) {
            localStorage.setItem('clienteDni', cliente.dni);
            await cargarProximaCita(cliente.dni);
        }
        
        // Cargar vehículo principal
        if (cliente.vehiculo_id) {
            await cargarVehiculoPrincipal(cliente.vehiculo_id, cliente.vehiculos);
        } else if (cliente.vehiculos && cliente.vehiculos.length > 0) {
            // Si no hay vehiculo_id pero sí hay vehículos, mostrar el primero
            await cargarVehiculoPrincipal(cliente.vehiculos[0].id, cliente.vehiculos);
        } else {
            const vehiculoDiv = document.getElementById('vehiculoPrincipal');
            if (vehiculoDiv) {
                vehiculoDiv.innerHTML = '<p>Sin vehículo registrado</p>';
                vehiculoDiv.classList.remove('placeholder');
            }
        }
        
        console.log('=== DASHBOARD CARGADO EXITOSAMENTE ===');
        
    } catch (error) {
        console.error('Error al cargar dashboard:', error);
        alert('Error al cargar el dashboard: ' + error.message);
    }
}

/**
 * Carga y muestra la próxima cita del cliente.
 * Filtra turnos pendientes/confirmados y ordena por fecha.
 * 
 * @param {string} dni - DNI del cliente
 */
async function cargarProximaCita(dni) {
    console.log('Buscando próxima cita para DNI:', dni);
    
    const proximaCitaDiv = document.getElementById('proximaCita');
    if (!proximaCitaDiv) {
        console.log('Elemento proximaCita no encontrado');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/turnos/turnos/buscar/${dni}/todos`);
        
        if (!response.ok) {
            if (response.status === 404) {
                proximaCitaDiv.innerHTML = '<p>No hay citas próximas</p>';
                proximaCitaDiv.classList.remove('placeholder');
                return;
            }
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const turnos = await response.json();
        console.log('Turnos obtenidos:', turnos);
        
        // Filtrar turnos pendientes o confirmados y ordenar por fecha
        const turnosPendientes = turnos
            .filter(t => 
                t.estado && 
                (t.estado.toLowerCase() === 'pendiente' || 
                 t.estado.toLowerCase() === 'confirmado')
            )
            .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
        
        if (turnosPendientes.length > 0) {
            const proximaCita = turnosPendientes[0];
            const fecha = new Date(proximaCita.fecha).toLocaleDateString('es-AR');
            const hora = proximaCita.hora || proximaCita.horario || 'Pendiente';
            
            proximaCitaDiv.innerHTML = `
                <div style="padding: 10px;">
                    <strong>📅 ${fecha}</strong><br>
                    <strong>🕐 ${hora}</strong><br>
                    <small>Estado: <span style="color: #4CAF50;">${proximaCita.estado || 'Pendiente'}</span></small>
                </div>
            `;
        } else {
            proximaCitaDiv.innerHTML = '<p>No hay citas próximas</p>';
        }
        
        proximaCitaDiv.classList.remove('placeholder');
        
    } catch (error) {
        console.error('Error al cargar próxima cita:', error);
        proximaCitaDiv.innerHTML = '<p>No hay citas próximas</p>';
        proximaCitaDiv.classList.remove('placeholder');
    }
}

/**
 * Carga y muestra el vehículo principal del cliente.
 * 
 * @param {number} vehiculoId - ID del vehículo principal
 * @param {Array} vehiculos - Array de vehículos del cliente (fallback)
 */
async function cargarVehiculoPrincipal(vehiculoId, vehiculos = []) {
    console.log('Cargando vehículo principal ID:', vehiculoId);
    
    const vehiculoDiv = document.getElementById('vehiculoPrincipal');
    if (!vehiculoDiv) {
        console.log('Elemento vehiculoPrincipal no encontrado');
        return;
    }
    
    try {
        // Buscar vehículo en array si está disponible (más rápido)
        let vehiculo = null;
        if (vehiculos && vehiculos.length > 0) {
            vehiculo = vehiculos.find(v => v.id === vehiculoId);
        }
        
        // Si no lo encontramos en el array, intentar obtenerlo del servidor
        if (!vehiculo && vehiculoId) {
            const response = await fetch(`${API_BASE}/api/vehiculos/${vehiculoId}`);
            if (response.ok) {
                vehiculo = await response.json();
            }
        }
        
        if (vehiculo) {
            const marcaModelo = `${vehiculo.marca || ''} ${vehiculo.modelo || ''}`.trim();
            const anio = vehiculo.anio || 'N/A';
            const patente = vehiculo.patente || 'N/A';
            
            vehiculoDiv.innerHTML = `
                <div style="padding: 10px;">
                    <strong>🚗 ${marcaModelo}</strong><br>
                    Año: ${anio}<br>
                    Patente: <span style="color: #2196F3;">${patente}</span>
                </div>
            `;
        } else {
            vehiculoDiv.innerHTML = '<p>Sin vehículo registrado</p>';
        }
        
        vehiculoDiv.classList.remove('placeholder');
        
    } catch (error) {
        console.error('Error al cargar vehículo principal:', error);
        vehiculoDiv.innerHTML = '<p>Sin vehículo registrado</p>';
        vehiculoDiv.classList.remove('placeholder');
    }
}

/**
 * FUNCIONES DE VEHÍCULOS
 */

/**
 * Carga y muestra TODOS los vehículos del cliente en la sección "Mis Vehículos".
 * Obtiene los datos del cliente y renderiza una card por cada vehículo.
 */
async function cargarMisVehiculos() {
    console.log('=== CARGANDO MIS VEHÍCULOS ===');
    
    const contenedor = document.getElementById('vehiculos-list');
    if (!contenedor) {
        console.error('Elemento vehiculos-list no encontrado');
        return;
    }
    
    try {
        const clienteId = localStorage.getItem('clienteId');
        if (!clienteId) {
            mostrarError(contenedor, 'No hay sesión activa');
            return;
        }
        
        // Obtener datos del cliente con sus vehículos
        const response = await fetch(`${API_BASE}/cliente/${clienteId}`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const cliente = await response.json();
        console.log('Datos del cliente obtenidos:', cliente);
        
        const vehiculos = cliente.vehiculos || [];
        
        // Limpiar contenedor
        contenedor.innerHTML = '';
        
        if (vehiculos.length === 0) {
            mostrarVacio(contenedor, 'No tienes vehículos registrados');
            return;
        }
        
        // Renderizar card por cada vehículo
        vehiculos.forEach(vehiculo => {
            const card = crearCardVehiculo(vehiculo, cliente.nombre);
            contenedor.appendChild(card);
        });
        
        console.log(`${vehiculos.length} vehículos cargados exitosamente`);
        
    } catch (error) {
        console.error('Error al cargar vehículos:', error);
        mostrarError(contenedor, 'Error al cargar los vehículos: ' + error.message);
    }
}

/**
 * Crea una tarjeta (card) HTML para mostrar un vehículo.
 * 
 * @param {Object} vehiculo - Objeto con datos del vehículo
 * @param {string} clienteNombre - Nombre del propietario
 * @returns {HTMLElement} Elemento div con la card del vehículo
 */
function crearCardVehiculo(vehiculo, clienteNombre) {
    const card = document.createElement('div');
    card.className = 'vehicle-card';
    card.style.cssText = `
        background: white;
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 12px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    `;
    
    card.innerHTML = `
        <div class="vehicle-info">
            <div class="vehicle-info-row">
                <strong>🚗 Marca:</strong>
                <span>${vehiculo.marca || 'N/A'}</span>
            </div>
            <div class="vehicle-info-row">
                <strong>Modelo:</strong>
                <span>${vehiculo.modelo || 'N/A'}</span>
            </div>
            <div class="vehicle-info-row">
                <strong>Año:</strong>
                <span>${vehiculo.anio || 'N/A'}</span>
            </div>
            <div class="vehicle-info-row">
                <strong>📋 Patente:</strong>
                <span style="color: #2196F3; font-weight: bold;">${vehiculo.patente || 'N/A'}</span>
            </div>
            <div class="vehicle-info-row">
                <strong>👤 Propietario:</strong>
                <span>${clienteNombre}</span>
            </div>
        </div>
    `;
    
    return card;
}

/**
 * FUNCIONES DE CITAS
 */

/**
 * Carga y muestra TODAS las citas del cliente (pendientes, en curso y finalizadas).
 * Agrupa las citas por estado para mejor visualización.
 */
async function cargarMisCitas() {
    console.log('=== CARGANDO MIS CITAS ===');
    
    const contenedor = document.getElementById('turnos-list');
    if (!contenedor) {
        console.error('Elemento turnos-list no encontrado');
        return;
    }
    
    try {
        const clienteDni = localStorage.getItem('clienteDni');
        
        if (!clienteDni) {
            mostrarError(contenedor, 'No se encontró DNI del cliente');
            return;
        }
        
        console.log('Buscando citas para DNI:', clienteDni);
        
        // Obtener todas las citas del cliente
        const response = await fetch(`${API_BASE}/api/turnos/turnos/buscar/${clienteDni}/todos`);
        
        if (!response.ok) {
            if (response.status === 404) {
                mostrarVacio(contenedor, 'No tienes citas registradas');
                return;
            }
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const citas = await response.json();
        console.log('Citas obtenidas:', citas);
        
        if (!citas || citas.length === 0) {
            mostrarVacio(contenedor, 'No tienes citas registradas');
            return;
        }
        
        // Limpiar contenedor
        contenedor.innerHTML = '';
        
        // Agrupar citas por estado
        const citasPorEstado = agruparCitasPorEstado(citas);
        
        // Renderizar por estado
        const orden = ['pendiente', 'confirmado', 'en curso', 'finalizado', 'cancelado'];
        
        orden.forEach(estado => {
            const citasEstado = citasPorEstado[estado] || [];
            if (citasEstado.length > 0) {
                // Agregar título de sección
                const titulo = document.createElement('h3');
                titulo.style.cssText = `
                    margin-top: 20px;
                    margin-bottom: 10px;
                    color: #333;
                    border-bottom: 2px solid #2196F3;
                    padding-bottom: 8px;
                `;
                titulo.textContent = `${capitalizarPrimera(estado)} (${citasEstado.length})`;
                contenedor.appendChild(titulo);
                
                // Agregar cards de citas
                citasEstado.forEach(cita => {
                    const card = crearCardCita(cita, estado);
                    contenedor.appendChild(card);
                });
            }
        });
        
        console.log('Citas cargadas exitosamente');
        
    } catch (error) {
        console.error('Error al cargar citas:', error);
        mostrarError(contenedor, 'Error al cargar las citas: ' + error.message);
    }
}

/**
 * Agrupa un array de citas por su estado.
 * 
 * @param {Array} citas - Array de citas
 * @returns {Object} Objeto con citas agrupadas por estado
 */
function agruparCitasPorEstado(citas) {
    const agrupadas = {};
    
    citas.forEach(cita => {
        const estado = (cita.estado || 'pendiente').toLowerCase();
        if (!agrupadas[estado]) {
            agrupadas[estado] = [];
        }
        agrupadas[estado].push(cita);
    });
    
    // Ordenar cada grupo por fecha
    Object.keys(agrupadas).forEach(estado => {
        agrupadas[estado].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    });
    
    return agrupadas;
}

/**
 * Crea una tarjeta (card) HTML para mostrar una cita.
 * 
 * @param {Object} cita - Objeto con datos de la cita/turno
 * @param {string} estado - Estado de la cita
 * @returns {HTMLElement} Elemento div con la card de la cita
 */
function crearCardCita(cita, estado) {
    const card = document.createElement('div');
    card.className = 'cita-card';
    
    const fecha = new Date(cita.fecha).toLocaleDateString('es-AR');
    const hora = cita.hora || cita.horario || 'Pendiente';
    
    // Color según estado
    let colorEstado = '#2196F3'; // azul por defecto
    if (estado === 'pendiente') colorEstado = '#FF9800';
    else if (estado === 'confirmado') colorEstado = '#2196F3';
    else if (estado === 'en curso') colorEstado = '#FFC107';
    else if (estado === 'finalizado') colorEstado = '#4CAF50';
    else if (estado === 'cancelado') colorEstado = '#F44336';
    
    card.style.cssText = `
        background: white;
        border-left: 4px solid ${colorEstado};
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 12px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    `;
    
    card.innerHTML = `
        <div class="cita-info">
            <div class="cita-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <div>
                    <strong>📅 ${fecha}</strong><br>
                    <strong>🕐 ${hora}</strong>
                </div>
                <span style="
                    background: ${colorEstado};
                    color: white;
                    padding: 5px 10px;
                    border-radius: 20px;
                    font-size: 0.85em;
                    font-weight: bold;
                ">
                    ${capitalizarPrimera(estado)}
                </span>
            </div>
            ${cita.descripcion ? `<p><strong>Descripción:</strong> ${cita.descripcion}</p>` : ''}
            ${cita.observaciones ? `<p><strong>Observaciones:</strong> ${cita.observaciones}</p>` : ''}
        </div>
    `;
    
    return card;
}

/**
 * FUNCIONES DE PERFIL
 */

/**
 * Carga y muestra los datos del perfil del cliente.
 * Permite editar nombre, email y DNI.
 */
async function cargarPerfilCliente() {
    console.log('=== CARGANDO PERFIL DEL CLIENTE ===');
    
    try {
        const clienteId = localStorage.getItem('clienteId');
        const clienteDni = localStorage.getItem('clienteDni');
        
        if (!clienteId) {
            alert('No hay sesión activa');
            return;
        }
        
        // Obtener datos del cliente
        const response = await fetch(`${API_BASE}/cliente/${clienteId}`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const cliente = await response.json();
        console.log('Datos del cliente:', cliente);
        
        // Llenar formulario con datos actuales
        const campoNombre = document.getElementById('nombre');
        const campoEmail = document.getElementById('email');
        const campoDni = document.getElementById('dni');
        
        if (campoNombre) campoNombre.value = cliente.nombre || '';
        if (campoEmail) campoEmail.value = cliente.email || '';
        if (campoDni) campoDni.value = cliente.dni || cliente.DNI || '';
        
        // Guardar DNI en localStorage si no lo tenemos
        if (cliente.dni && !localStorage.getItem('clienteDni')) {
            localStorage.setItem('clienteDni', cliente.dni);
        }
        
        // Configurar botón de guardado
        const formPerfil = document.getElementById('perfil-form');
        if (formPerfil) {
            formPerfil.addEventListener('submit', async (e) => {
                e.preventDefault();
                await guardarCambiosPerfil(cliente.dni || cliente.DNI);
            });
        }
        
        console.log('Perfil cargado exitosamente');
        
    } catch (error) {
        console.error('Error al cargar perfil:', error);
        alert('Error al cargar el perfil: ' + error.message);
    }
}

/**
 * Guarda los cambios realizados en el perfil del cliente.
 * 
 * @param {string} dni - DNI del cliente
 */
async function guardarCambiosPerfil(dni) {
    console.log('Guardando cambios de perfil para DNI:', dni);
    
    try {
        const nombre = document.getElementById('nombre').value;
        const email = document.getElementById('email').value;
        
        if (!nombre || !email) {
            alert('Por favor completa todos los campos requeridos');
            return;
        }
        
        const datosActualizados = {
            nombre: nombre,
            email: email
        };
        
        const response = await fetch(`${API_BASE}/clientes/${dni}/editar`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosActualizados)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Error al guardar cambios');
        }
        
        const resultado = await response.json();
        console.log('Cambios guardados:', resultado);
        
        alert('✅ Perfil actualizado exitosamente');
        
        // Actualizar localStorage y header
        const clienteGuardado = JSON.parse(localStorage.getItem('cliente') || '{}');
        clienteGuardado.nombre = nombre;
        clienteGuardado.email = email;
        localStorage.setItem('cliente', JSON.stringify(clienteGuardado));
        localStorage.setItem('clienteNombre', nombre);
        
        // Actualizar header
        await actualizarHeaderCliente();
        
    } catch (error) {
        console.error('Error al guardar cambios:', error);
        alert('❌ Error al guardar cambios: ' + error.message);
    }
}

/**
 * FUNCIONES DE UTILIDAD
 */

/**
 * Muestra un mensaje de error en un contenedor.
 * 
 * @param {HTMLElement} contenedor - Elemento donde mostrar el error
 * @param {string} mensaje - Texto del error
 */
function mostrarError(contenedor, mensaje) {
    contenedor.innerHTML = `
        <div class="error-container" style="
            text-align: center;
            padding: 30px;
            color: #F44336;
        ">
            <div style="font-size: 48px; margin-bottom: 10px;">⚠️</div>
            <h3>Error</h3>
            <p>${mensaje}</p>
        </div>
    `;
    contenedor.classList.remove('placeholder');
}

/**
 * Muestra un mensaje cuando no hay datos disponibles.
 * 
 * @param {HTMLElement} contenedor - Elemento donde mostrar el mensaje
 * @param {string} mensaje - Texto del mensaje
 */
function mostrarVacio(contenedor, mensaje) {
    contenedor.innerHTML = `
        <div class="empty-container" style="
            text-align: center;
            padding: 30px;
            color: #999;
        ">
            <div style="font-size: 48px; margin-bottom: 10px;">📭</div>
            <h3>Sin datos</h3>
            <p>${mensaje}</p>
        </div>
    `;
    contenedor.classList.remove('placeholder');
}

/**
 * Capitaliza la primera letra de un texto.
 * 
 * @param {string} texto - Texto a capitalizar
 * @returns {string} Texto con primera letra mayúscula
 */
function capitalizarPrimera(texto) {
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

/**
 * FUNCIONES DE LOGOUT
 */

/**
 * Configura el botón de logout para cerrar sesión.
 */
function configurarLogout() {
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', cerrarSesion);
    }
}

/**
 * Cierra la sesión del cliente eliminando datos de localStorage
 * y redirigiendo al login.
 */
function cerrarSesion() {
    console.log('=== CERRANDO SESIÓN ===');
    
    // Limpiar localStorage
    localStorage.removeItem('cliente');
    localStorage.removeItem('clienteId');
    localStorage.removeItem('clienteNombre');
    localStorage.removeItem('clienteEmail');
    localStorage.removeItem('clienteDni');
    
    console.log('Sesión cerrada. Redirigiendo a login...');
    
    // Redirigir al login
    window.location.href = '/MecApp/frontend/login.html';
}