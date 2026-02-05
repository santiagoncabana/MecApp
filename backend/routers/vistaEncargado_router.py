from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from ..crud.vistas_Encargado_crud import obtener_cliente_por_dni, obtener_todos_clientes, obtener_todos_los_vehiculos
from ..schemas.cliente_schemas import ClienteOut,ClienteResponse
from ..schemas.vehiculos_schemas import vehiculos
from ..database.database import get_db
from fastapi import HTTPException


router = APIRouter(prefix="/api/clientes", tags=["clientes"])

@router.get("/clientes", response_model=List[ClienteResponse])
def listar_clientes(db: Session = Depends(get_db)):
    clientes = obtener_todos_clientes(db)
    return clientes

@router.get("/dni/{dni}")
def obtener_cliente_por_dni_endpoint(dni: str, db: Session = Depends(get_db)):
    cliente = obtener_cliente_por_dni(db, dni)
    
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    
    #Ingresar respuesta manualmente si no pediria todo lo del ClientOut y que no queremos que el empleado ingrese el numero de telefono cuando lo busca por el DNI
    response = {
        "id": cliente.id,
        "nombre": cliente.nombre,
        "email": cliente.email,
        "contrasena": cliente.contrasena,
        "DNI": (cliente.DNI),
        "telefono": cliente.telefono,
        "vehiculo_id": cliente.vehiculo_id,  #AGREGAR vehículo principal
        "vehiculos": [  #AGREGAR lista de vehículos
            {
                "id": v.id,
                "patente": v.patente,
                "modelo": v.modelo,
                "marca": v.marca,
                "anio": v.anio
            }
            for v in cliente.vehiculos
        ]
    }
    
    #si no tiene teléfono
    if not cliente.telefono:
        response["advertencia"] = "Este cliente aún no registró su número de teléfono"
        
    # si no tiene vehículos
    if not cliente.vehiculos:
        response["advertencia_vehiculos"] = "Este cliente aún no tiene vehículos registrados"
    return response


#Obtener todos los vehiculos registrados
@router.get("/vehiculos", response_model=List[vehiculos])
def Obtener_todos_los_vehiculos(db: Session = Depends(get_db)):
    All_vehiculos = obtener_todos_los_vehiculos(db)
    return All_vehiculos