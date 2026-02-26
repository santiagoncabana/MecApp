const API_BASE = 'http://localhost:8000';

// Estado global
let allTurnos = [];
let currentFilter = 'todos';
let turnoToDelete = null;

// -------------------- FETCH DATA --------------------

async function fetchTurnos() {
    try {
        console.log('Fetching turnos...');
        const res = await fetch(`${API_BASE}/api/turnos/obtenerTodoLosTurnos`, {
            
        });
        if (!res.ok) throw new Error('Error al obtener turnos');
        const data = await res.json();
        console.log('Turnos data:', data);
        return data;
    } catch (error) {
        console.error('Error fetching turnos:', error);
        return null;
    }
}

async function updateTurno(turnoDNI, turnoData) {
    try {
        const res = await fetch(`${API_BASE}/api/turnos/${turnoDNI}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            
            body: JSON.stringify(turnoData)
        });
        if (!res.ok) throw new Error('Error al actualizar turno');
        return await res.json();
    } catch (error) {
        console.error('Error updating turno:', error);
        alert('Error al actualizar el turno');
        return null;
    }
}

async function deleteTurno(turnoId) {
    try {
        const res = await fetch(`${API_BASE}/api/turnos/${turnoId}`, {
            method: 'DELETE',
           
        });
        if (!res.ok) throw new Error('Error al eliminar turno');
        return await res.json();
    } catch (error) {
        console.error('Error deleting turno:', error);
        alert('Error al eliminar el turno');
        return null;
    }
}

async function createOrdenServicio(ordenData) {
    try {
        const res = await fetch(`${API_BASE}/api/orden_de_servicio/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            
            body: JSON.stringify(ordenData)
        });
        if (!res.ok) throw new Error('Error al crear orden de servicio');
        return await res.json();
    } catch (error) {
        console.error('Error creating orden:', error);
        alert('Error al crear la orden de servicio');
        return null;
    }
}

// -------------------- RENDER --------------------

function getEstadoLabel(estado) {
    const labels = {
        'pendiente': 'PENDIENTE',
        'en_curso': 'EN CURSO',
        'finalizado': 'FINALIZADO'
    };
    return labels[estado] || estado.toUpperCase();
}

function createAppointmentCard(turno) {
    const card = document.createElement('div');
    card.className = `appointment-card ${turno.estado}`;
    
    const clienteNombre = turno.cliente?.nombre || 'Cliente desconocido';
    const vehiculoInfo = turno.vehiculo_id ? `Vehículo ID: ${turno.vehiculo_id}` : 'Sin vehículo';
    const empleadoNombre = turno.empleado?.nombre || 'Sin asignar';
    const ordenInfo = turno.orden_servicio 
        ? `✅ Orden #${turno.orden_servicio.id || turno.orden_servicio.orden_id || 'N/A'}` 
        : '⚠️ Sin orden de servicio';

    const telefono = turno.cliente?.telefono || turno.telefono || 'N/A';
    const dni = turno.cliente?.DNI || turno.DNI || 'N/A';

    card.innerHTML = `
        <div class="appointment-time">${turno.hora || 'Sin hora'}</div>
        <div class="appointment-info">
            <p><strong>Cliente:</strong> ${clienteNombre}</p>
            <p><strong>Vehículo:</strong> ${vehiculoInfo}</p>
            <p><strong>Empleado:</strong> ${empleadoNombre}</p>
            <p><strong>Fecha:</strong> ${turno.fecha || 'Sin fecha'}</p>
            <p><strong>Teléfono:</strong> ${telefono}</p>
            <p><strong>DNI:</strong> ${dni}</p>
        </div>
        <span class="appointment-status ${turno.estado}">${getEstadoLabel(turno.estado)}</span>
        <div class="appointment-orden">${ordenInfo}</div>
        <div class="appointment-actions">
            <button class="btn-icon edit" data-id="${turno.id}" data-dni="${turno.DNI}">
                ✏️ Editar
            </button>
            <button class="btn-icon delete" data-id="${turno.id}" 
                    ${turno.orden_servicio ? 'disabled' : ''}>
                🗑️ Eliminar
            </button>       
            ${turno.orden_servicio 
                ? `<button class="btn-icon ver-orden" data-id="${turno.orden_servicio.id}">
                       👁️ Ver Orden
                   </button>`
                : `<button class="btn-icon orden" data-id="${turno.id}" 
                           ${turno.estado !== 'finalizado' ? 'disabled' : ''}>
                       📋 Crear Orden
                   </button>`
            }
        </div>
    `;
    
    return card;
}

function renderTurnos(turnos) {
    const container = document.getElementById('appointments-container');
    container.innerHTML = '';
    
    if (!turnos || turnos.length === 0) {
        container.innerHTML = `
            <div class="empty-container">
                <h3>No hay citas para mostrar</h3>
                <p>No se encontraron citas con los filtros seleccionados.</p>
            </div>
        `;
        return;
    }
    
    turnos.forEach(turno => {
        const card = createAppointmentCard(turno);
        container.appendChild(card);
    });
}

function updateStats(turnos) {
    const confirmadas = turnos.filter(t => t.estado === 'en_curso' || t.estado === 'finalizado').length;
    const canceladas = 0;
    
    document.getElementById('citas-confirmadas').textContent = confirmadas;
    document.getElementById('citas-canceladas').textContent = canceladas;
}

function filterTurnos(estado) {
    if (estado === 'todos') {
        renderTurnos(allTurnos);
    } else {
        const filtered = allTurnos.filter(t => t.estado === estado);
        renderTurnos(filtered);
    }
}

// -------------------- MODALS --------------------

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
}

function openEditModal(turno) {
    document.getElementById('edit-turno-dni').value = turno.DNI;
    document.getElementById('edit-fecha').value = turno.fecha;
    document.getElementById('edit-hora').value = turno.hora;
    document.getElementById('edit-telefono').value = turno.telefono || '';
    document.getElementById('edit-dni').value = turno.DNI || '';
    document.getElementById('edit-estado').value = turno.estado;
    
    openModal('edit-modal');
}

function openOrdenModal(turno) {
    document.getElementById('orden-turno-id').value = turno.id;
    document.getElementById('orden-turno-display').textContent = turno.id;
    document.getElementById('orden-cliente-display').textContent = turno.cliente?.nombre || 'N/A';
    document.getElementById('orden-vehiculo-display').textContent = 
        turno.vehiculo_id ? `ID: ${turno.vehiculo_id}` : 'N/A';
    
    openModal('orden-modal');
}

function openVerOrdenModal(orden) {
    document.getElementById('detalle-orden-id').textContent = orden.id;
    document.getElementById('detalle-cliente').textContent = orden.nombre_cliente || 'N/A';
    document.getElementById('detalle-vehiculo').textContent = `${orden.marca || ''} ${orden.modelo || ''}`.trim() || 'N/A';
    document.getElementById('detalle-patente').textContent = orden.patente || 'N/A';
    document.getElementById('detalle-descripcion').textContent = orden.descripcion_trabajo || 'N/A';
    document.getElementById('detalle-precio').textContent = orden.precio_total || '0';
    
    openModal('ver-orden-modal');
}

function openDeleteModal(turnoId) {
    turnoToDelete = turnoId;
    openModal('delete-modal');
}

// -------------------- EVENT HANDLERS --------------------

// Filtros
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-btn')) {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        e.target.classList.add('active');
        
        const estado = e.target.dataset.estado;
        currentFilter = estado;
        filterTurnos(estado);
    }
});

// Botones de acciones en cards
document.addEventListener('click', (e) => {
    const editBtn = e.target.closest('.btn-icon.edit');
    const deleteBtn = e.target.closest('.btn-icon.delete');
    const ordenBtn = e.target.closest('.btn-icon.orden');
    const verOrdenBtn = e.target.closest('.btn-icon.ver-orden');
    
    if (editBtn) {
        const turnoId = parseInt(editBtn.dataset.id);
        const turno = allTurnos.find(t => t.id === turnoId);
        if (turno) openEditModal(turno);
    }
    
    if (deleteBtn && !deleteBtn.disabled) {
        const turnoId = parseInt(deleteBtn.dataset.id);
        openDeleteModal(turnoId);
    }
    
    if (ordenBtn && !ordenBtn.disabled) {
        const turnoId = parseInt(ordenBtn.dataset.id);
        const turno = allTurnos.find(t => t.id === turnoId);
        if (turno) openOrdenModal(turno);
    }
    
    if (verOrdenBtn) {
        const ordenId = parseInt(verOrdenBtn.dataset.id);
        const turno = allTurnos.find(t => t.orden_servicio?.id === ordenId);
        if (turno && turno.orden_servicio) {
            openVerOrdenModal(turno.orden_servicio);
        }
    }
});

// Modal overlays y close buttons
document.querySelectorAll('.modal-overlay, .modal-close').forEach(el => {
    el.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal');
        if (modal) modal.classList.remove('active');
    });
});

// Botones de cancelar
document.getElementById('cancel-edit')?.addEventListener('click', () => closeModal('edit-modal'));
document.getElementById('cancel-orden')?.addEventListener('click', () => closeModal('orden-modal'));
document.getElementById('cancel-delete')?.addEventListener('click', () => closeModal('delete-modal'));
document.getElementById('cerrar-ver-orden')?.addEventListener('click', () => closeModal('ver-orden-modal'));

// Form: Editar turno
document.getElementById('edit-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const turnoDNI = document.getElementById('edit-turno-dni').value;
    const turnoData = {
        fecha: document.getElementById('edit-fecha').value,
        hora: document.getElementById('edit-hora').value,
        telefono: document.getElementById('edit-telefono').value,
        DNI: document.getElementById('edit-dni').value,
        estado: document.getElementById('edit-estado').value
    };
    
    const result = await updateTurno(turnoDNI, turnoData);
    if (result) {
        alert('Turno actualizado exitosamente');
        closeModal('edit-modal');
        loadTurnos();
    }
});

// Form: Crear orden
document.getElementById('orden-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const turnoId = parseInt(document.getElementById('orden-turno-id').value);
    const turno = allTurnos.find(t => t.id === turnoId);
    
    if (!turno) {
        alert('No se encontró el turno');
        return;
    }
    
    const ordenData = {
        descripcion_trabajo: document.getElementById('orden-descripcion').value,
        precio_total: parseFloat(document.getElementById('orden-precio').value),
        turno_id: turno.id,
        cliente_id: turno.cliente_id,
        empleado_id: turno.empleado_id,
        vehiculo_id: turno.vehiculo_id,
        patente: turno.vehiculo?.patente || '',
        modelo: turno.vehiculo?.modelo || '',
        marca: turno.vehiculo?.marca || '',
        anio: turno.vehiculo?.anio || new Date().getFullYear(),
        fecha_turno: turno.fecha
    };
    
    const result = await createOrdenServicio(ordenData);
    if (result) {
        alert('Orden de servicio creada exitosamente');
        closeModal('orden-modal');
        document.getElementById('orden-form').reset();
        loadTurnos();
    }
});

// Confirmación de eliminación
document.getElementById('confirm-delete')?.addEventListener('click', async () => {
    if (turnoToDelete) {
        const result = await deleteTurno(turnoToDelete);
        if (result) {
            alert('Turno eliminado exitosamente');
            closeModal('delete-modal');
            turnoToDelete = null;
            loadTurnos();
        }
    }
});

// -------------------- INIT --------------------

async function loadTurnos() {
    const container = document.getElementById('appointments-container');
    container.innerHTML = `
        <div class="loading-container">
            <div class="loading-spinner"></div>
            <p>Cargando citas...</p>
        </div>
    `;
    
    const turnos = await fetchTurnos();
    
    if (!turnos) {
        container.innerHTML = `
            <div class="error-container">
                <h3>⚠️ Error al cargar citas</h3>
                <p>No se pudieron obtener los datos del servidor.</p>
            </div>
        `;
        return;
    }
    
    allTurnos = turnos;
    updateStats(turnos);
    filterTurnos(currentFilter);
}

// Cargar al iniciar
document.addEventListener('DOMContentLoaded', loadTurnos);