from pydantic import BaseModel
from typing import Optional, List

        
class ClienteOut(BaseModel):  #ClienteOut se usa para la respuesta (response_model) y agrega id
    nombre: str         
    id: int
    email: str         #Agregue email, contrasena y telefono para ver esos datos en la vista del encargado cuando llame a todos los clientes
    contrasena: str
    telefono: Optional[int] = None #Esto hace que el cliente que todavia no registro su numero muestre null
    
    class config:
        orm_mode = True #orm_mode = True permite que Pydantic convierta instancias ORM (objetos SQLAlchemy) a dict/JSON sin problemas
        
class VehiculoResponse(BaseModel):
    id: int
    patente: str
    modelo: str
    marca: Optional[str] = None
    anio: Optional[int] = None
    
    class Config:
        from_attributes = True


class ClienteResponse(BaseModel):
    id: int
    nombre: str
    email: str
    DNI: int
    telefono: Optional[str] = None
    vehiculo_id: Optional[int] = None  #Vehículo principal
    vehiculos: List[VehiculoResponse] = []  #Lista de TODOS sus vehículos
    
    class Config:
        from_attributes = True