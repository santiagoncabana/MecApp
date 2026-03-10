# 📋 Documentación - Dashboard Cliente

## 🎯 Descripción General

Se ha implementado un **Sistema Centralizado de Gestión del Dashboard del Cliente** que maneja todas las secciones mediante un único archivo JavaScript (`dashboard-cliente.js`) con comentarios detallados en cada función.

---

## 📁 Estructura de Archivos

```
MecApp/
├── frontend/Pagues-clientes/
│   ├── dashboard-cliente.html        ✅ Dashboard principal
│   ├── mis-vehiculos.html             ✅ Listado de vehículos
│   ├── mis-citas.html                 ✅ Listado de citas
│   └── perfil-cliente.html            ✅ Perfil del cliente
│
└── js/
    ├── dashboard-cliente.js           ✅ ARCHIVO PRINCIPAL (toda la lógica)
    └── mis-vehiculos.js               ❌ DESCARTADO (funcionalidad movida a dashboard-cliente.js)
```

---

## 🔧 Funcionalidades Implementadas

### 1️⃣ **Autenticación y Sesión**
- ✅ Verifica que el usuario esté logueado al cargar cualquier página
- ✅ Si no hay sesión, redirige automáticamente a login
- ✅ Mantiene datos en `localStorage` para acceso rápido

### 2️⃣ **Header Dinámico (Todas las Páginas)**
- ✅ Muestra el nombre del cliente en la esquina superior derecha
- ✅ Genera avatar con la primera letra del nombre
- ✅ Se actualiza automáticamente en TODAS las secciones
- ✅ Botón de "Salir" para cerrar sesión

### 3️⃣ **Dashboard Principal** (dashboard-cliente.html)
**Muestra:**
- 📅 **Próxima Cita**: La cita más próxima pendiente/confirmada
- 🚗 **Vehículo Principal**: El vehículo asignado al cliente
- 🔗 Enlace rápido para "Reservar nueva cita"

### 4️⃣ **Mis Vehículos** (mis-vehiculos.html)
**Muestra:**
- 🚗 TODOS los vehículos del cliente logueado
- Detalles: Marca, Modelo, Año, Patente
- Nombre del propietario
- **Nota**: Filtra automáticamente vehículos solo del cliente actual

### 5️⃣ **Mis Citas** (mis-citas.html)
**Muestra:**
- 📋 TODAS las citas del cliente agrupadas por estado:
  - 🟠 Pendiente
  - 🔵 Confirmado
  - 🟡 En Curso
  - 🟢 Finalizado
  - 🔴 Cancelado
- Ordenadas por fecha (más próximas primero)
- Detalles: Fecha, Hora, Estado, Descripción

### 6️⃣ **Mi Perfil** (perfil-cliente.html)
**Permite:**
- 📝 Editar Nombre
- 📧 Editar Email
- 🆔 Ver DNI (solo lectura)
- 💾 Guardar cambios
- 🔄 Actualiza header automáticamente después de guardar

---

## 📚 Funciones Comentadas

### Inicialización y Sesión

#### `window.addEventListener('DOMContentLoaded', ...)`
Evento al cargar la página. Verifica sesión y redirige si es necesario.

#### `inicializarPagina()`
Coordina la carga de datos según la página actual.

#### `obtenerPaginaActual()`
Determina cuál página se está visitando basándose en la URL.

---

### Header y Usuario

#### `actualizarHeaderCliente()`
**¿Qué hace?**
- Obtiene datos del cliente desde `localStorage` o del servidor
- Actualiza nombre en el header `#userName`
- Genera avatar con primera letra del nombre
- Se ejecuta en TODAS las páginas automáticamente

**Entrada:** Ninguna (usa `localStorage.getItem('clienteId')`)
**Salida:** Objeto con datos del cliente

---

### Dashboard Principal

#### `cargarDashboard()`
**¿Qué hace?**
- Carga título de bienvenida personalizado
- Obtiene próxima cita del cliente
- Carga vehículo principal
- Maneja fallbacks si no hay datos

#### `cargarProximaCita(dni)`
**¿Qué hace?**
- Obtiene todas las citas del cliente
- Filtra solo las pendientes/confirmadas
- Ordena por fecha (más próximas primero)
- Muestra la primera en el dashboard

**Entrada:** `dni` (string)
**Endpoint:** `GET /api/turnos/turnos/buscar/{dni}/todos`

#### `cargarVehiculoPrincipal(vehiculoId, vehiculos)`
**¿Qué hace?**
- Busca el vehículo principal en el array de vehículos
- Si no lo encuentra, lo obtiene del servidor (fallback)
- Muestra marca, modelo, año y patente
- Maneja si no hay vehículo asignado

**Entrada:** `vehiculoId` (número), `vehiculos` (array)
**Endpoint:** `GET /api/vehiculos/{vehiculoId}` (fallback)

---

### Vehículos

#### `cargarMisVehiculos()`
**¿Qué hacer?**
- Obtiene todos los vehículos del cliente
- Renderiza una card por cada vehículo
- Limpia contenedor antes de cargar
- Muestra mensaje si no hay vehículos

**Endpoint:** `GET /cliente/{clienteId}`

#### `crearCardVehiculo(vehiculo, clienteNombre)`
**¿Qué hace?**
- Crea un elemento HTML (card) con datos del vehículo
- Incluye marca, modelo, año, patente, propietario
- Estilos CSS inline para mejor visualización

**Entrada:** `vehiculo` (objeto), `clienteNombre` (string)
**Salida:** Elemento DOM `<div>`

---

### Citas

#### `cargarMisCitas()`
**¿Qué hace?**
- Obtiene todas las citas del cliente por DNI
- Agrupa citas por estado
- Ordena cada grupo por fecha
- Renderiza secciones con títulos para cada estado

**Endpoint:** `GET /api/turnos/turnos/buscar/{dni}/todos`

#### `agruparCitasPorEstado(citas)`
**¿Qué hace?**
- Organiza citas en un objeto por su estado
- Ordena cada grupo cronológicamente

**Entrada:** `citas` (array)
**Salida:** Objeto `{ estado: [citas] }`

#### `crearCardCita(cita, estado)`
**¿Qué hace?**
- Crea una tarjeta con información de la cita
- Color del borde según estado:
  - 🟠 Naranja = Pendiente
  - 🔵 Azul = Confirmado
  - 🟡 Amarillo = En Curso
  - 🟢 Verde = Finalizado
  - 🔴 Rojo = Cancelado
- Muestra fecha, hora, estado, descripción

**Entrada:** `cita` (objeto), `estado` (string)
**Salida:** Elemento DOM `<div>`

---

### Perfil

#### `cargarPerfilCliente()`
**¿Qué hace?**
- Obtiene datos actuales del cliente
- Rellena el formulario con datos guardados
- Configura evento al enviar formulario
- Guarda DNI en `localStorage` si no existe

**Endpoint:** `GET /cliente/{clienteId}`

#### `guardarCambiosPerfil(dni)`
**¿Qué hace?**
- Valida que nombre y email no estén vacíos
- Envía cambios al servidor
- Actualiza `localStorage`
- Actualiza header automáticamente
- Muestra confirmación al usuario

**Endpoint:** `PUT /clientes/{dni}/editar`
**Datos enviados:** `{ nombre, email }`

---

### Utilidades

#### `mostrarError(contenedor, mensaje)`
Renderiza un mensaje de error en un contenedor.

#### `mostrarVacio(contenedor, mensaje)`
Renderiza un mensaje cuando no hay datos.

#### `capitalizarPrimera(texto)`
Convierte "pendiente" → "Pendiente", etc.

---

### Logout

#### `configurarLogout()`
Vincula el botón "Salir" con la función de cierre de sesión.

#### `cerrarSesion()`
**¿Qué hace?**
- Elimina TODOS los datos de `localStorage`
- Redirige a la página de login
- Cierra sesión del usuario

**Datos eliminados:**
- `cliente` (objeto completo)
- `clienteId` (número)
- `clienteNombre` (string)
- `clienteEmail` (string)
- `clienteDni` (string)

---

## 🔌 Endpoints API Utilizados

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/cliente/{cliente_id}` | Obtener cliente con vehículos |
| GET | `/api/turnos/turnos/buscar/{dni}/todos` | Obtener todas las citas |
| PUT | `/clientes/{dni}/editar` | Actualizar perfil |
| POST | `/login` | Autenticación (en auth.js) |

---

## 💾 LocalStorage

El sistema mantiene estos datos en `localStorage`:

```javascript
{
  "cliente": { /* objeto completo del cliente */ },
  "clienteId": 1,                    // ID numérico
  "clienteNombre": "Juan Pérez",     // Nombre completo
  "clienteEmail": "juan@email.com",  // Email
  "clienteDni": "12345678"           // DNI (agregado durante inicialización)
}
```

---

## 🎨 Características de Diseño

### Colors por Estado de Cita
- 🟠 **Pendiente**: #FF9800 (Naranja)
- 🔵 **Confirmado**: #2196F3 (Azul)
- 🟡 **En Curso**: #FFC107 (Amarillo)
- 🟢 **Finalizado**: #4CAF50 (Verde)
- 🔴 **Cancelado**: #F44336 (Rojo)

### Iconos Usados
- 📅 Citas/Fechas
- 🕐 Horas
- 🚗 Vehículos
- 📋 Patentes
- 👤 Propietarios
- ⚠️ Errores
- 📭 Sin datos

---

## 🔍 Depuración

El código incluye muchos `console.log()` que ayudan a depuración:

```javascript
console.log('=== PÁGINA CARGADA ===');
console.log('Sesión válida. Inicializando página...');
console.log('Página actual:', paginaActual);
```

**Para ver logs:** F12 → Consola

---

## ✅ Checklist de Implementación

- ✅ Autenticación en todas las páginas
- ✅ Header dinámico con nombre del usuario
- ✅ Avatar con primera letra
- ✅ Próxima cita en dashboard
- ✅ Vehículo principal en dashboard
- ✅ Todos los vehículos del cliente en "Mis Vehículos"
- ✅ Todas las citas groupadas por estado en "Mis Citas"
- ✅ Edición de perfil con guardado
- ✅ Botón de logout en todas las páginas
- ✅ Comentarios detallados en cada función
- ✅ Fallbacks para errores de conexión
- ✅ Manejo correcto del DNI (normalizado)

---

## 📖 Cómo Usar

### 1. Iniciar Sesión
```javascript
// Se guarda automáticamente en login
localStorage.setItem('clienteId', cliente.id);
localStorage.setItem('clienteDni', cliente.dni);
```

### 2. Acceder a Datos del Cliente
```javascript
const clienteId = localStorage.getItem('clienteId');
const clienteDni = localStorage.getItem('clienteDni');
```

### 3. Cargar Datos en Nueva Página
```javascript
// Automático con window.addEventListener('DOMContentLoaded')
// Solo ocurre si hay clienteId válido
```

---

## 🐛 Solución de Problemas

### El nombre no aparece en el header
**Solución:** Verifica que `localStorage.getItem('clienteId')` devuelva un valor válido

### No se cargan los vehículos
**Solución:** Verifica que el cliente tenga vehículos en la base de datos: `cliente.vehiculos`

### Las citas no se cargan
**Solución:** Verifica que el DNI sea correcto: `localStorage.getItem('clienteDni')`

### Los cambios de perfil no se guardan
**Solución:** Asegúrate de usar el DNI correcto: `cliente.dni` o `cliente.DNI`

---

## 📝 Cambios Realizados

### Archivos Modificados
1. **dashboard-cliente.js** - Reescrito completamente con nueva estructura
2. **dashboard-cliente.html** - Agregado header dinámico y botón logout
3. **mis-vehiculos.html** - Scripts y header actualizados
4. **mis-citas.html** - Scripts y header actualizados
5. **perfil-cliente.html** - Scripts y header actualizados
6. **auth.js** - Agregada guardado de DNI en localStorage
7. **clienteAuth_router.py** - Normalizado devuelve 'dni' en minúsculas

### Archivos Descartados
- **mis-vehiculos.js** - Funcionalidad integrada en dashboard-cliente.js

---

## 🚀 Próximos Pasos

1. Probar todas las secciones con múltiples clientes
2. Verificar que el DNI se guarda correctamente
3. Validar que los filtros de estado de cita funcionan
4. Agregar funcionalidad de foto de perfil si se necesita
5. Implementar actualización automática de datos en tiempo real

---

**Versión:** 1.0
**Última actualización:** Marzo 7, 2026
**Estado:** ✅ Completado
