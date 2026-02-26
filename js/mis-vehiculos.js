const API_BASE = 'http://localhost:8000';

// Cache para clientes
const clientesCache = new Map();

// Obtener todos los vehículos
async function fetchVehiculos() {
    try {
        console.log('Fetching vehicles from:', `${API_BASE}/api/clientes/vehiculos`);
        const res = await fetch(`${API_BASE}/api/clientes/vehiculos`, { 
             
        });
        console.log('Response status:', res.status);
        if (!res.ok) throw new Error('Error al obtener vehículos');
        const data = await res.json();
        console.log('Vehicles data:', data);
        return data;
    } catch (error) {
        console.error('Error fetching vehicles:', error);
        return null;
    }
}

// Obtener información de un cliente
async function fetchClienteById(clienteId) {
    // Revisar cache primero
    if (clientesCache.has(clienteId)) {
        return clientesCache.get(clienteId);
    }

    try {
        const res = await fetch(`${API_BASE}/api/clientes/clientes`, { 
         
        });
        if (!res.ok) return null;
        
        const clientes = await res.json();
        const cliente = clientes.find(c => 
            String(c.id) === String(clienteId) || 
            String(c.cliente_id) === String(clienteId)
        );

        // Guardar en cache
        if (cliente) {
            clientesCache.set(clienteId, cliente);
        }

        return cliente;
    } catch (error) {
        console.error('Error fetching client:', error);
        return null;
    }
}

// Crear card de vehículo
function createVehicleCard(vehiculo, clienteNombre) {
    const card = document.createElement('div');
    card.className = 'vehicle-card';
    
    card.innerHTML = `
        <div class="vehicle-info">
            <div class="vehicle-info-row">
                <strong>ID:</strong>
                <span>${vehiculo.id || 'N/A'}</span>
            </div>
            <div class="vehicle-info-row">
                <strong>Marca:</strong>
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
                <strong>Patente:</strong>
                <span class="vehicle-patente">${vehiculo.patente || 'N/A'}</span>
            </div>
            <div class="vehicle-cliente">
                <div class="vehicle-info-row">
                    <strong>Cliente :</strong>
                    <span>${clienteNombre || `ID: ${vehiculo.cliente}`}</span>
                </div>
            </div>
        </div>
    `;
    
    return card;
}

// Renderizar estado de error
function renderError() {
    const container = document.getElementById('vehicles-container');
    container.innerHTML = `
        <div class="error-container">
            <div class="error-icon">⚠️</div>
            <h3>Error al cargar vehículos</h3>
            <p>No se pudieron obtener los datos del servidor.</p>
        </div>
    `;
}

// Renderizar estado vacío
function renderEmpty() {
    const container = document.getElementById('vehicles-container');
    container.innerHTML = `
        <div class="empty-container">
            <div class="empty-icon">🚗</div>
            <h3>No hay vehículos registrados</h3>
            <p>Aún no se han registrado vehículos en el sistema.</p>
        </div>
    `;
}

// Cargar y renderizar vehículos
async function loadVehiculos() {
    const container = document.getElementById('vehicles-container');
    
    // Obtener vehículos
    const vehiculos = await fetchVehiculos();
    
    if (!vehiculos) {
        renderError();
        return;
    }

    if (vehiculos.length === 0) {
        renderEmpty();
        return;
    }

    // Limpiar container
    container.innerHTML = '';

    // Crear cards para cada vehículo
    for (const vehiculo of vehiculos) {
        const cliente = await fetchClienteById(vehiculo.cliente_id);
        const clienteNombre = cliente ? (cliente.nombre || cliente.name || null) : null;
        
        const card = createVehicleCard(vehiculo, clienteNombre);
        container.appendChild(card);
    }
}

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', loadVehiculos);