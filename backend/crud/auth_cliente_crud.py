from sqlalchemy.orm import Session, joinedload
from ..database.models import Cliente,Empleado, Vehiculo
from ..schemas.auth_schema import ClienteRegister,ClienteUpdate
from MecApp.backend.security.security import pwd_context

def create_cliente(db: Session, cliente: ClienteRegister):
    db_cliente = Cliente(
        nombre=cliente.nombre,
        email=cliente.email,
        contrasena=cliente.contrasena,
        DNI=cliente.DNI
    )
    db.add(db_cliente)
    db.commit()
    db.refresh(db_cliente)
    return db_cliente



def autenticacion_cliente(db: Session, correo: str, contrasena_user: str):
    cliente = db.query(Cliente).filter(Cliente.email == correo).first()
    
    if not cliente:
        return None
    if cliente.contrasena == contrasena_user:
        return cliente
    return None




def autenticacion_encargado(db: Session, correo: str, contrasena_user: str):
    empleado = db.query(Empleado).filter(Empleado.email == correo).first()
    
    if not empleado:
        return None
    if empleado.contrasena == contrasena_user:
        return empleado
    return None

#Editar perfil cliente
def actualizar_perfil_por_dni(db: Session, dni: str, ClienteUpdate:ClienteUpdate):
    #Buscar el cliente por DNI
    cliente = db.query(Cliente).filter(Cliente.DNI == dni).first()
    
    if not cliente:
        raise ValueError(f"No se encontró cliente con DNI {dni}")
    
    #Actualizar campos
    if ClienteUpdate.nombre:
        cliente.nombre = ClienteUpdate.nombre
    
    if ClienteUpdate.email:
        cliente.email = ClienteUpdate.email
    
    if ClienteUpdate.contrasena:
        cliente.contrasena = ClienteUpdate.contrasena
    
    db.commit()
    db.refresh(cliente)
    
    return cliente