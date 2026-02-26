const API_BASE = 'http://localhost:8000';

// -------------------- FETCH DATA --------------------

async function fetchAllClientes() {
    try {
        const res = await fetch(`${API_BASE}/api/clientes/clientes`);
        if (!res.ok) throw new Error('Error al obtener clientes');
        return await res.json();
    } catch (e) {
        console.error('Error fetching clients', e);
        return [];
    }
}

async function fetchClientById(id) {
    try {
        const res = await fetch(`${API_BASE}/api/clientes/clientes`);
        if (!res.ok) return null;
        const list = await res.json();
        return list.find(c => 
            String(c.id) === String(id) || 
            String(c.cliente_id) === String(id) || 
            String(c.DNI) === String(id)
        ) || null;
    } catch (e) {
        console.error('Error fetching client', e);
        return null;
    }
}

// -------------------- RENDER TABLE --------------------

function renderClientesTable(clientes) {
    const tbody = document.querySelector('table tbody');
    if (!tbody) return;
    
    if (!clientes || clientes.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center;">No hay clientes registrados</td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = clientes.map(cliente => `
        <tr data-client-id="${cliente.id || cliente.cliente_id}">
            <td>${cliente.id || cliente.cliente_id || 'N/A'}</td>
            <td>${cliente.nombre || 'Sin nombre'}</td>
            <td>${cliente.email || 'N/A'}</td>
            <td><button class="view-btn">Ver</button></td>
        </tr>
    `).join('');
}

async function loadClientes() {
    const tbody = document.querySelector('table tbody');
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center;">Cargando clientes...</td>
            </tr>
        `;
    }
    
    const clientes = await fetchAllClientes();
    renderClientesTable(clientes);
}

// -------------------- MODAL --------------------

function openModal() {
    const modal = document.getElementById('client-modal');
    if (!modal) return;
    modal.style.display = 'flex';
}

function closeModal() {
    const modal = document.getElementById('client-modal');
    if (!modal) return;
    modal.style.display = 'none';
    const content = document.getElementById('client-modal-content');
    if (content) content.innerHTML = '';
}

function renderClientIntoModal(client) {
    const content = document.getElementById('client-modal-content');
    if (!content) return;

    if (!client) {
        content.innerHTML = `
            <h3>Información no disponible</h3>
            <div class="client-detail">
                <p>No se pudo localizar información del cliente.</p>
            </div>
        `;
        return;
    }

    content.innerHTML = `
        <h3>Detalles del Cliente</h3>
        <div class="client-detail">
            <p><strong>ID:</strong> ${client.id || client.cliente_id || 'N/A'}</p>
            <p><strong>Nombre:</strong> ${client.nombre || client.name || 'Sin nombre'}</p>
            <p><strong>DNI:</strong> ${client.DNI || client.dni || 'N/A'}</p>
            <p><strong>Email:</strong> ${client.email || client.mail || 'N/A'}</p>
            <p><strong>Teléfono:</strong> ${client.telefono || client.phone || 'N/A'}</p>
        </div>
    `;
}

// -------------------- EVENT HANDLERS --------------------

// Click en botón Ver - abrir modal
document.addEventListener('click', async (e) => {
    const btn = e.target.closest('.view-btn');
    if (!btn) return;
    
    const row = btn.closest('tr');
    const clientId = row?.dataset?.clientId;

    openModal();
    const content = document.getElementById('client-modal-content');
    if (content) {
        content.innerHTML = '<div class="client-detail"><p><em>Cargando información...</em></p></div>';
    }

    let client = null;
    if (clientId) client = await fetchClientById(clientId);

    renderClientIntoModal(client);
});

// -------------------- INIT --------------------

document.addEventListener('DOMContentLoaded', () => {
    // Cargar clientes al iniciar
    loadClientes();
    
    // Configurar modal
    const closeBtn = document.getElementById('client-modal-close');
    const overlay = document.getElementById('client-modal-overlay');
    
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (overlay) overlay.addEventListener('click', closeModal);

    document.addEventListener('keydown', (ev) => {
        if (ev.key === 'Escape') closeModal();
    });
});