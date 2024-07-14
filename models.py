from sqlalchemy import Column, String, Integer, Float, create_engine
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class SubwayOutlet(Base):
    __tablename__ = 'subway_outlets'
    id = Column(Integer, primary_key=True)
    name = Column(String)
    address = Column(String)
    operating_hours = Column(String)
    waze_link = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)

engine = create_engine('sqlite:///subway_outlets.db')
Base.metadata.create_all(engine)
