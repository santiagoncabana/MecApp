# Importamos las Librerias
from sqlalchemy import Column, Integer, String, Date,Time, ForeignKey, Float, Boolean
from sqlalchemy.orm import relationship
from .database import Base

class Cliente(Base):
    __tablename__ = "cliente"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True) # Pk
    nombre = Column(String(100))
    email = Column(String(100), unique=True)
    contrasena = Column(String(100))
    DNI = Column(Integer, unique=True)
    telefono = Column(String(20))
    vehiculo_id = Column(Integer)
    
    vehiculos = relationship("Vehiculo",foreign_keys="[Vehiculo.cliente_id]",back_populates="cliente")
    turnos = relationship("Turno", back_populates="cliente")


class Vehiculo(Base):
    __tablename__ = "vehiculo"

    id = Column(Integer, primary_key=True) # Pk
    marca = Column(String(50))
    modelo = Column(String(50))
    anio = Column(Integer)
    patente = Column(String(20), unique=True)
    cliente_id = Column(Integer, ForeignKey("cliente.id"))

    cliente = relationship("Cliente", back_populates="vehiculos")


class Empleado(Base):
    __tablename__ = "empleado"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True) # Pk
    nombre = Column(String(100))
    email = Column(String(100), unique=True)
    contrasena = Column(String(100))
    rol = Column(String(50))  
    disponible= Column(Boolean, default="true")  

    turnos = relationship("Turno", back_populates="empleado")


class Turno(Base):
    __tablename__ = "turno"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    cliente_id = Column(Integer, ForeignKey("cliente.id"), nullable=False)
    empleado_id = Column(Integer, ForeignKey("empleado.id"), nullable=False)
    fecha = Column(String, nullable=False)
    hora = Column(String, nullable=False)
    telefono = Column(String(20)) 
    DNI = Column(String(20))
    estado = Column(String(50), default="pendiente")

    cliente = relationship("Cliente", back_populates="turnos", lazy="select")
    empleado = relationship("Empleado", back_populates="turnos", lazy="select")
    orden_servicio = relationship("OrdenDeServicio", back_populates="turno", uselist=False, lazy="noload")


class OrdenDeServicio(Base):
    __tablename__ = "orden_de_servicio"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True) # Pk
    descripcion_trabajo = Column(String(255))
    precio_total = Column(Float)
    turno_id = Column(Integer, ForeignKey("turno.id"))
    patente = Column(String(20))
    modelo = Column(String(50))
    marca = Column(String(50))
    nombre_cliente = Column(String(100))
    telefono_cliente = Column(String(20))
    dni_cliente = Column(String(20))
    fecha_cliente = Column(String)
    empleado_id = Column(Integer, ForeignKey("empleado.id"))
    anio = Column(Integer)
    vehiculo_id = Column(Integer, ForeignKey("vehiculo.id"))

    turno = relationship("Turno", back_populates="orden_servicio", lazy="noload")