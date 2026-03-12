// Funcionalidad compartida para modal de registro de empleado en todas las páginas del encargado
const API_BASE_URL = 'http://localhost:8000';

function configurarRegistroEmpleado() {
    const btnRegisterEmpleado = document.getElementById('btnRegisterEmpleado');
    const registerModal = document.getElementById('register-empleado-modal');
    const registerForm = document.getElementById('register-empleado-form');
    const registerClose = document.getElementById('register-empleado-close');
    const cancelBtn = document.getElementById('cancel-empleado');

    if (!btnRegisterEmpleado || !registerModal) {
        console.warn('Modal de registro no encontrado en esta página');
        return;
    }

    if (btnRegisterEmpleado) {
        btnRegisterEmpleado.addEventListener('click', () => {
            console.log('Abriendo modal de registrar empleado...');
            registerModal.classList.add('active');
            registerForm.reset();
        });
    }

    // Cerrar modal con el botón X
    if (registerClose) {
        registerClose.addEventListener('click', () => {
            registerModal.classList.remove('active');
        });
    }

    // Cerrar modal con botón Cancelar
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            registerModal.classList.remove('active');
        });
    }

    // Cerrar modal al hacer clic en el overlay
    const modalOverlay = registerModal.querySelector('.modal-overlay');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', () => {
            registerModal.classList.remove('active');
        });
    }

    // Manejar envío del formulario
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const nombre = document.getElementById('empleado-nombre').value.trim();
            const email = document.getElementById('empleado-email').value.trim();
            const contrasena = document.getElementById('empleado-contrasena').value.trim();
            const rol = document.getElementById('empleado-rol').value;
            const disponible = document.getElementById('empleado-disponible').checked;

            if (!nombre || !email || !contrasena || !rol) {
                alert('Por favor completa todos los campos requeridos');
                return;
            }

            await registrarEmpleado({
                nombre,
                email,
                contrasena,
                rol,
                disponible
            });
        });
    }
}

/**
 * Registra un nuevo empleado en el sistema
 * @param {Object} empleado - Datos del empleado a registrar
 */
async function registrarEmpleado(empleado) {
    const messageElement = document.getElementById('empleado-message');
    
    try {
        console.log('Registrando empleado:', empleado);
        
        const response = await fetch(`${API_BASE_URL}/register/encargado`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(empleado)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error al registrar empleado:', errorData);
            
            messageElement.style.display = 'block';
            messageElement.style.background = '#fecaca';
            messageElement.style.color = '#991b1b';
            messageElement.textContent = `Error: ${errorData.detail || 'No se pudo registrar el empleado'}`;
            return;
        }

        const result = await response.json();
        console.log('✅ Empleado registrado exitosamente:', result);
        
        messageElement.style.display = 'block';
        messageElement.style.background = '#dcfce7';
        messageElement.style.color = '#166534';
        messageElement.textContent = `✓ Empleado registrado exitosamente: ${empleado.nombre}`;
        
        // Limpiar formulario
        document.getElementById('register-empleado-form').reset();
        
        // Cerrar modal después de 2 segundos
        setTimeout(() => {
            document.getElementById('register-empleado-modal').classList.remove('active');
            messageElement.style.display = 'none';
        }, 2000);

    } catch (error) {
        console.error('Error de conexión al registrar empleado:', error);
        messageElement.style.display = 'block';
        messageElement.style.background = '#fecaca';
        messageElement.style.color = '#991b1b';
        messageElement.textContent = `Error de conexión: ${error.message}`;
    }
}
