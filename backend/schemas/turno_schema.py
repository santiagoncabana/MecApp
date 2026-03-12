
from pydantic import BaseModel
from datetime import date, time
from database.models import Cliente, Turno
from typing import Optional


class VehiculoBasico(BaseModel):
    id: int
    marca: str
    modelo: str
    patente: str
    anio: int
    
    class Config:
        from_attributes = True


class ClienteBasico(BaseModel):
    id: int
    nombre: str
    telefono: str | None = None
    DNI: int | None = None
    vehiculos: list[VehiculoBasico] = []
    
    class Config:
        from_attributes = True

class EmpleadoBasico(BaseModel):
    id: int
    nombre: str
    
    class Config:
        from_attributes = True






# -------------------------------------------------------


class TurnoCreate(BaseModel):
    # Datos del Cliente
    telefono: str
    DNI: str
    
    # Datos del Turno
    fecha: str  
    hora: str   
    estado: str = "Pendiente"
    
 # ------------------------------------------------------------


    
class OrdenResponse(BaseModel):
    id: int
    turno_id: int
    descripcion_trabajo: str
    precio_total: int
    patente: str
    modelo: str
    marca: str
    anio: int
    nombre_cliente: str
    telefono_cliente: str
    dni_cliente: str
    fecha_cliente: str
    empleado_id: int
    vehiculo_id: int
    
    class Config:
        from_attributes = True

# -------------------------------------------------------------------
class TurnoResponse(BaseModel):
    id: int
    cliente_id: int
    empleado_id: int
    fecha: str
    hora: str
    estado: str
    DNI: str | None = None
    vehiculo_id: int | None = None
    orden_servicio: Optional[OrdenResponse] = None
    cliente: Optional[ClienteBasico] = None       # Agregar
    empleado: Optional[EmpleadoBasico] = None
    class Config:
        from_attributes = True


# --------------------------------------------------------------


class DashboardStats(BaseModel):
    citas_hoy: int
    clientes_activos: int
    vehiculos_en_taller: int
    ingresos_mensuales: int


# ------------------------------------------------------------------

class TurnoUpdate(BaseModel):
    estado: str = "Finalizado"
    
class orden_de_servicio_create(BaseModel):
    descripcion_trabajo: str
    precio_total: int
    turno_id: int
    patente: str
    modelo: str
    marca: str
    anio : int

# ------------------------------------------------------
class OrdenCreate(BaseModel):
    turno_id: int
    descripcion_trabajo: str
    precio_total: int
    patente: str
    modelo: str
    marca: str
    anio: int



# -------------------------------------------------------------------

