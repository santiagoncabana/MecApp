from fastapi import APIRouter, Depends, HTTPException
from ..database.database import get_db, Session
from ..crud.auth_cliente_crud import create_cliente,autenticacion_cliente  ,autenticacion_encargado ,actualizar_perfil_por_dni
from ..crud.vistas_Encargado_crud import create_empleado
from ..schemas.auth_schema import ClienteRegister, ClienteLogin, ClienteUpdate
from ..database.models import Cliente
from ..schemas.auth_schema import EncargadoLogin, EmpleadoRegister
from fastapi import Form
from MecApp.backend.security.security import pwd_context
from ..crud.turno_cliente_crud import get_turno_y_orden_por_DNI_cliente
from typing import List
from ..schemas.turno_schema import TurnoResponse


SECRET_KEY = "cabana"
ALGORITHM = "HS256"

router = APIRouter()

@router.post("/register")
def register(
    DNI: str = Form(...),
    nombre: str = Form(...),
    email: str = Form(...),
    contrasena: str = Form(...),
    db: Session = Depends(get_db)
):
    if db.query(Cliente).filter(Cliente.DNI == DNI).first():
        raise HTTPException(400, "DNI ya registrado")

    #hashed = pwd_context.hash(contrasena)
    cliente = Cliente(DNI=DNI, nombre=nombre, email=email, contrasena=contrasena)
    db.add(cliente)
    db.commit()
    db.refresh(cliente)
    return {"mensaje": "Cliente creado", "id": cliente.id}
    

#Registro Encargado
@router.post("/register/encargado", tags=["register encargado"])
def registerEncargado(empleado: EmpleadoRegister, db: Session = Depends(get_db)):
    return create_empleado(db, empleado)


# Login Cliente
@router.post("/login", tags=["login cliente"])
def loginCliente(cliente: ClienteLogin, db: Session = Depends(get_db)):
    user = autenticacion_cliente(db, cliente.email, cliente.contrasena)
    
    if user:
        return {
            "message": "Autenticación exitosa",
            "cliente": {
                "id": user.id,
                "nombre": user.nombre,
                "email": user.email,
                "telefono": user.telefono,
                "dni": user.DNI,
                "vehiculo_id": user.vehiculo_id
            }
        }
    
    raise HTTPException(status_code=401, detail="Credenciales incorrectas")

# Login Encargado
@router.post("/encargado/login", tags=["login encargado"])
def loginEncargado(cliente: EncargadoLogin, db: Session = Depends(get_db)):
    user = autenticacion_encargado(db, cliente.email, cliente.contrasena)
    if user:
        return {
            "message": "Autenticación exitosa",
            "email": user.email,
            "nombre": user.nombre,
            "rol": user.rol
        }
    raise HTTPException(status_code=401, detail="Credenciales incorrectas para el encargado")

#editar perfil del cliente
@router.put("/clientes/{dni}/editar")
def actualizar_perfil_cliente(
    dni: str,
    datos: ClienteUpdate,
    db: Session = Depends(get_db)
):
    try:
        cliente = actualizar_perfil_por_dni(db, dni, datos)
        
        return {
            "mensaje": "Perfil actualizado exitosamente",
            "cliente": {
                "id": cliente.id,
                "nombre": cliente.nombre,
                "email": cliente.email,
                "DNI": str(cliente.DNI)
            }
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))