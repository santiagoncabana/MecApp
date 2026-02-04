from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database.database import get_db
from ..crud.Orden_de_servicio_crud import create_orden, actualizar_turno_estado
from ..schemas.turno_schema import orden_de_servicio_create, OrdenResponse



router = APIRouter(prefix="/api/orden_de_servicio", tags=["orden_de_servicio"])

@router.post("/")
def crear_orden_de_servicio(orden: orden_de_servicio_create, db: Session = Depends(get_db)):
    try:
        nueva_orden = create_orden(db, orden)
        return {
            "mensaje": "Orden de servicio creada exitosamente",
            "orden_id": nueva_orden.id,
            "descripcion_trabajo": nueva_orden.descripcion_trabajo,
            "precio_total": nueva_orden.precio_total,
            "turno_id": nueva_orden.turno_id,
            "patente": nueva_orden.patente,
            "modelo": nueva_orden.modelo,
            "marca": nueva_orden.marca,
            "anio": nueva_orden.anio,
            "fecha_turno": nueva_orden.fecha_cliente,
            "empleado_id": nueva_orden.empleado_id,
            "vehiculo_id": nueva_orden.vehiculo_id
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@router.put("/turnos/{turno_id}/estado")
def cambiar_estado(turno_id: int, estado: str, db: Session = Depends(get_db)):
    try:
        turno = actualizar_turno_estado(db, turno_id, estado)
        return {"mensaje": "Estado actualizado", "turno_id": turno.id}
    except ValueError as e:
        raise HTTPException(400, str(e))
    