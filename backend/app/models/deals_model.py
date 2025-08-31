from sqlalchemy import Column, Integer, String,Float,DateTime
from app.database import Base


class DealsCustomer(Base):
    __tablename__ = "deals"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), index=True)
    amount = Column(Float)
    stage = Column(String(100))
    date = Column(DateTime)
    contact = Column(String(100))
     