// 1. Lógica para el Formulario de REGISTRO
const registerForm = document.getElementById('registerForm');

if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const nombre = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        const data = { nombre, email, contrasena: password };

        await enviarDatos(data);
    });
}

async function enviarDatos(data) {
    try {
        const response = await fetch('http://127.0.0.1:8000/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error al registrar:', errorData);
            alert('Error: ' + errorData.detail); 
            return;
        }

        console.log('Registro exitoso!');
        window.location.href = '/MecApp/frontend/formulario.html';

    } catch (error) {
        console.error('Error de conexión o fetch:', error); 
        alert('Error de conexión con el servidor.');
    }
}

// 2. Lógica para el Formulario de LOGIN - UNIFICADO (Cliente y Encargado)
const loginForm = document.getElementById('loginForm');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        const loginData = {
            email: email,
            contrasena: password 
        };

        await loginUnificado(loginData);
    });
}

/**
 * Realiza login unificado detectando automáticamente el tipo de usuario (Cliente o Encargado)
 * @param {Object} data - { email, contrasena }
 */
async function loginUnificado(data) {
    try {
        console.log('Intentando login... Email:', data.email);
        
        // Desactivar botón del formulario
        const btnLogin = document.querySelector('.login-btn');
        const btnOriginalText = btnLogin.textContent;
        btnLogin.disabled = true;
        btnLogin.textContent = 'Cargando...';
        
        // 1. Intentar primero como CLIENTE
        console.log('Intentando login como CLIENTE...');
        let response = await fetch('http://127.0.0.1:8000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            const result = await response.json();
            console.log('✅ Login exitoso como CLIENTE', result);
            
            // Guardar como CLIENTE
            guardarClienteEnStorage(result.cliente);
            localStorage.setItem('userType', 'cliente');
            localStorage.setItem('tipoUsuario', 'cliente');
            
            await new Promise(resolve => setTimeout(resolve, 500));
            window.location.href = '/MecApp/frontend/Pagues-clientes/dashboard-cliente.html';
            return;
        }

        // 2. Si falla como cliente, intentar como ENCARGADO
        console.log('Login como cliente falló. Intentando como ENCARGADO...');
        response = await fetch('http://127.0.0.1:8000/encargado/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            const result = await response.json();
            console.log('✅ Login exitoso como ENCARGADO', result);
            
            // Guardar como ENCARGADO
            guardarEncargadoEnStorage(result);
            localStorage.setItem('userType', 'encargado');
            localStorage.setItem('tipoUsuario', 'encargado');
            
            await new Promise(resolve => setTimeout(resolve, 500));
            window.location.href = '/MecApp/frontend/Pages_encargado/dashboard-encargado.html';
            return;
        }

        // 3. Si ambos fallan, mostrar error
        const errorData = await response.json();
        console.error('❌ Error de login en ambos intentos:', errorData);
        
        btnLogin.disabled = false;
        btnLogin.textContent = btnOriginalText;
        
        alert(`❌ Credenciales incorrectas.\nVerifica tu email y contraseña.`);
        
    } catch (error) {
        console.error('Error de conexión:', error);
        
        const btnLogin = document.querySelector('.login-btn');
        btnLogin.disabled = false;
        btnLogin.textContent = 'Iniciar Sesión';
        
        alert('⚠️ Error de conexión con el servidor: ' + error.message);
    }
}

/**
 * Guarda los datos del cliente en localStorage
 * @param {Object} cliente - Datos del cliente
 */
function guardarClienteEnStorage(cliente) {
    console.log('Guardando datos de CLIENTE en localStorage...', cliente);
    
    localStorage.setItem('cliente', JSON.stringify(cliente));
    localStorage.setItem('clienteId', cliente.id);
    localStorage.setItem('clienteNombre', cliente.nombre);
    localStorage.setItem('clienteEmail', cliente.email);
    localStorage.setItem('clienteDni', cliente.dni);
    
    console.log('✅ Datos de cliente guardados');
}

/**
 * Guarda los datos del encargado en localStorage
 * @param {Object} encargado - Datos del encargado
 */
function guardarEncargadoEnStorage(encargado) {
    console.log('Guardando datos de ENCARGADO en localStorage...', encargado);
    
    localStorage.setItem('encargado', JSON.stringify(encargado));
    localStorage.setItem('encargadoEmail', encargado.email);
    localStorage.setItem('encargadoNombre', encargado.nombre);
    localStorage.setItem('encargadoRol', encargado.rol || 'encargado');
    
    console.log('✅ Datos de encargado guardados');
}