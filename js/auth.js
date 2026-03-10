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

// 2. Lógica para el Formulario de LOGIN
const loginForm = document.getElementById('loginForm');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        const endpointURL = 'http://127.0.0.1:8000/login';
        const redirectURL = '/MecApp/frontend/Pagues-clientes/dashboard-cliente.html';

        const loginData = {
            email: email,
            contrasena: password 
        };

        await enviarLogin(loginData, endpointURL, redirectURL);
    });
}

async function enviarLogin(data, url, redirect) {
    try {
        console.log('Enviando login...'); // DEBUG
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        console.log('Respuesta recibida:', response.status); // DEBUG

        if (response.ok) {
            const result = await response.json();
            console.log('Login exitoso:', result); // DEBUG
            
            // Guardar información del cliente en localStorage
            if (result.cliente) {
                console.log('Guardando datos en localStorage...'); // DEBUG
                
                localStorage.setItem('cliente', JSON.stringify(result.cliente));
                localStorage.setItem('clienteId', result.cliente.id);
                localStorage.setItem('clienteNombre', result.cliente.nombre);
                localStorage.setItem('clienteEmail', result.cliente.email);
                localStorage.setItem('clienteDni', result.cliente.dni);
                
                // Verificar que se guardó correctamente
                const verificacion = localStorage.getItem('clienteId');
                console.log('ClienteId guardado:', verificacion); // DEBUG
                
                // Esperar un momento antes de redirigir
                await new Promise(resolve => setTimeout(resolve, 100));
                
                // Redirigir al dashboard
                window.location.href = redirect;
            } else {
                console.error('ERROR: No se recibió objeto cliente en la respuesta');
                alert('Error: No se recibieron datos del cliente');
            }
            
        } else {
            const errorData = await response.json();
            console.error('Error de login:', errorData); // DEBUG
            alert(`Error de Login: ${errorData.detail || 'Credenciales incorrectas.'}`);
        }
    } catch (error) {
        console.error('Error de conexión:', error);
        alert('Error de conexión con el servidor: ' + error.message);
    }
}