from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import os
from dotenv import load_dotenv
from database import models
import importlib

load_dotenv()   

SQLALCHEMY_DATABASE_URL = "postgresql://postgres:Angel4660@localhost:5432/MecApp"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 


from . import models 

    

def create_db_tables():
    # ...
    try:
        # Pasa checkfirst=True. Esto evita el error 1050 de MySQL.
        models.Base.metadata.create_all(bind=engine, checkfirst=True) 
        print("INFO: Tablas verificadas/creadas exitosamente.")
    except Exception as e:
        print(f"ERROR: Falló la creación de tablas. Detalles: {e}")