from database.models import OrdenDeServicio
from sqlalchemy.orm import Session
from database.models import Cliente, Turno, Vehiculo


    
def create_orden(db: Session, orden: OrdenDeServicio):
    #Buscar el turno
    turno = db.query(Turno).filter(Turno.id == orden.turno_id).first()
    if not turno:
        raise ValueError("Turno no encontrado")
    
    #Buscar el cliente relacionado al turno
    cliente = db.query(Cliente).filter(Cliente.id == turno.cliente_id).first()
    if not cliente:
        raise ValueError("Cliente no encontrado")
    
    # Buscar vehículo por PATENTE únicamente (es única en el sistema)
    vehiculo = db.query(Vehiculo).filter(Vehiculo.patente == orden.patente).first()
    
    if not vehiculo:
        #Si NO existe, lo creamos
        vehiculo = Vehiculo(
            patente=orden.patente,
            modelo=orden.modelo,
            marca=orden.marca,
            anio=orden.anio,
            cliente_id=cliente.id  #Asignamos el ID del cliente dueño
        )
        db.add(vehiculo)
        db.flush()  #Para obtener el ID del vehículo

    else:
        raise ValueError("Patente ya existente")
    
    cliente.vehiculo_id = vehiculo.id
    
    #Datos ingresados por el empleado al crear la orden
    nueva_orden = OrdenDeServicio(
        turno_id=orden.turno_id,
        descripcion_trabajo=orden.descripcion_trabajo,
        precio_total=orden.precio_total,
        patente=orden.patente,
        modelo=orden.modelo,
        anio=orden.anio,
        marca=orden.marca,
        
        #AUTOCOMPLETAR DESDE CLIENTE Y TURNO
        nombre_cliente=cliente.nombre,
        telefono_cliente=turno.telefono,  
        dni_cliente=turno.DNI,
        fecha_cliente=turno.fecha,
        empleado_id=turno.empleado_id,
        vehiculo_id=vehiculo.id
    )
    
    turno.estado = "finalizado" #Actualiza el estado del turno en la a finalizado
    
    
    db.add(nueva_orden)
    db.commit()
    db.refresh(nueva_orden)
    db.refresh(cliente)
    return nueva_orden

def actualizar_turno_estado(db: Session, turno_id: int, nuevo_estado: str):
    turno = db.query(Turno).filter(Turno.id == turno_id).first()
    
    if not turno:
        raise ValueError("Turno no encontrado")
    
    #Validaciones de negocio
    estados_validos = ["Pendiente", "Finalizado"]
    if nuevo_estado not in estados_validos:
        raise ValueError(f"Estado inválido. Use: {estados_validos}")
    
    #Actualizar
    turno.estado = nuevo_estado
    db.commit()
    db.refresh(turno)
    return turno