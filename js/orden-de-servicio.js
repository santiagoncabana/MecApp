const API_BASE = 'http://localhost:8000';

// Estado global
let currentTurno = null;

// -------------------- UTILIDADES --------------------

function obtenerParametrosURL() {
    const params = new URLSearchParams(window.location.search);
    return {
        turno_id: params.get('turno_id'),
        cliente_id: params.get('cliente_id'),
        turno_dni: params.get('turno_dni'),
        vehiculo_id: params.get('vehiculo_id')
    };
}

// -------------------- FETCH DATA --------------------

async function fetchTurnoById(turnoId) {
    try {
        const res = await fetch(`${API_BASE}/api/turnos/obtenerTodoLosTurnos`);
        if (!res.ok) throw new Error('Error al obtener turnos');
        
        const data = await res.json();
        const turno = data.find(t => t.id === parseInt(turnoId));
        
        if (!turno) throw new Error('Turno no encontrado');
        return turno;
    } catch (error) {
        console.error('Error fetching turno:', error);
        alert('Error al cargar los datos del turno');
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

// -------------------- RENDERIZAR INFORMACIÓN --------------------

function mostrarInfoTurno(turno) {
    currentTurno = turno;
    
    console.log('mostrarInfoTurno - turno completo:', turno);
    console.log('Cliente vehiculos:', turno.cliente?.vehiculos);
    
    // Datos del turno
    document.getElementById('info-turno-id').textContent = turno.id || '-';
    document.getElementById('info-turno-fecha').textContent = turno.fecha || '-';
    document.getElementById('info-turno-hora').textContent = turno.hora || '-';
    
    // Datos del cliente
    document.getElementById('info-cliente-nombre').textContent = turno.cliente?.nombre || '-';
    document.getElementById('info-cliente-id').textContent = turno.cliente_id || turno.cliente?.id || '-';
    document.getElementById('info-cliente-dni').textContent = turno.cliente?.DNI || turno.DNI || '-';
    document.getElementById('info-cliente-telefono').textContent = turno.cliente?.telefono || turno.telefono || '-';
    
    // Datos del vehículo - IMPORTANTE: acceder correctamente a los datos
    let marca = '-';
    let modelo = '-';
    let patente = '-';
    let anio = new Date().getFullYear();
    let vehiculoId = '-';
    
    // Prioridad: cliente.vehiculos[0] > vehiculo directo > nada
    if (turno.cliente?.vehiculos && turno.cliente.vehiculos.length > 0) {
        const vehiculo = turno.cliente.vehiculos[0];
        marca = vehiculo.marca || '-';
        modelo = vehiculo.modelo || '-';
        patente = vehiculo.patente || '-';
        anio = vehiculo.anio || new Date().getFullYear();
        vehiculoId = vehiculo.id || '-';
    } else if (turno.vehiculo) {
        marca = turno.vehiculo.marca || '-';
        modelo = turno.vehiculo.modelo || '-';
        patente = turno.vehiculo.patente || '-';
        anio = turno.vehiculo.anio || new Date().getFullYear();
        vehiculoId = turno.vehiculo.id || '-';
    }
    
    console.log('Datos finales vehículo:', { marca, modelo, patente, anio, vehiculoId });
    
    // Mostrar en info-grid
    document.getElementById('info-vehiculo-marca').textContent = marca;
    document.getElementById('info-vehiculo-modelo').textContent = modelo;
    document.getElementById('info-vehiculo-patente').textContent = patente;
    document.getElementById('info-vehiculo-id').textContent = vehiculoId;
    
    // Llenar formulario con valores reales
    const turnoIdVal = turno.id || '';
    const clienteIdVal = turno.cliente_id || turno.cliente?.id || '';
    
    document.getElementById('form-turno-id').value = turnoIdVal;
    document.getElementById('form-cliente-id').value = clienteIdVal;
    document.getElementById('form-vehiculo-id').value = vehiculoId !== '-' ? vehiculoId : '';
    document.getElementById('form-patente').value = patente;
    document.getElementById('form-marca').value = marca;
    document.getElementById('form-modelo').value = modelo;
    document.getElementById('form-anio').value = anio;
}

// -------------------- EVENT HANDLERS --------------------

document.getElementById('orden-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!currentTurno) {
        alert('Error: Turno no cargado');
        return;
    }
    
    const turnoId = parseInt(document.getElementById('form-turno-id').value);
    const clienteId = parseInt(document.getElementById('form-cliente-id').value);
    const vehiculoId = parseInt(document.getElementById('form-vehiculo-id').value);
    const descripcion = document.getElementById('form-descripcion').value.trim();
    const precio = parseFloat(document.getElementById('form-precio').value);
    
    if (!descripcion || !precio || precio < 0) {
        alert('Por favor completa todos los campos requeridos correctamente');
        return;
    }
    
    const ordenData = {
        descripcion_trabajo: descripcion,
        precio_total: precio,
        turno_id: turnoId,
        cliente_id: clienteId,
        empleado_id: currentTurno.empleado_id || null,
        vehiculo_id: vehiculoId,
        patente: currentTurno.cliente?.vehiculos?.[0]?.patente || '',
        marca: currentTurno.cliente?.vehiculos?.[0]?.marca || '',
        modelo: currentTurno.cliente?.vehiculos?.[0]?.modelo || '',
        anio: currentTurno.cliente?.vehiculos?.[0]?.anio || new Date().getFullYear(),
        fecha_turno: currentTurno.fecha
    };
    
    console.log('Enviando orden:', ordenData);
    
    const result = await createOrdenServicio(ordenData);
    if (result) {
        alert('✓ Orden de servicio creada exitosamente');
        window.location.href = './citas.html';
    }
});

// -------------------- INIT --------------------

async function cargarTurno() {
    const params = obtenerParametrosURL();
    
    console.log('Parámetros URL:', params);
    
    if (!params.turno_id) {
        alert('Error: No se especificó un turno. Vuelve a las citas.');
        window.location.href = './citas.html';
        return;
    }
    
    const turno = await fetchTurnoById(params.turno_id);
    if (turno) {
        mostrarInfoTurno(turno);
    } else {
        window.location.href = './citas.html';
    }
}

document.addEventListener('DOMContentLoaded', cargarTurno);
