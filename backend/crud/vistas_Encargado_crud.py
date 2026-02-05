from sqlalchemy.orm import Session, joinedload
from database.models import Cliente, Vehiculo, Empleado
#from .auth_cliente_crud import create_cliente
from schemas.auth_schema import EmpleadoRegister
    
def obtener_cliente_por_dni(db: Session, dni: str):
    cliente = (
        db.query(Cliente)
        .options(joinedload(Cliente.vehiculos))  # ← Cargar todos los vehículos
        .filter(Cliente.DNI == dni)
        .first()
    )
    
    if not cliente:
        raise ValueError(f"No se encontró cliente con DNI {dni}")
    
    return cliente


def obtener_todos_clientes(db: Session):
    clientes = (
        db.query(Cliente)
        .options(joinedload(Cliente.vehiculos))  #Cargar vehículos de todos
        .all()
    )
    
    return clientes

#Funciones de Vehiculos
def obtener_todos_los_vehiculos(db:Session):
    return db.query(Vehiculo).all()


#Registrar empleado
def create_empleado(db: Session, empleado: EmpleadoRegister):
    db_empleado = Empleado(
        nombre=empleado.nombre,
        email=empleado.email,
        contrasena=empleado.contrasena,
        rol=empleado.rol,
        disponible=empleado.disponible
    )
    db.add(db_empleado)
    db.commit()
    db.refresh(db_empleado)
    return db_empleado