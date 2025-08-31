from pydantic import BaseModel, Field, EmailStr
from typing import Annotated
from datetime import datetime


class DealsSchema(BaseModel):
    name: Annotated[str, Field(..., title='Customer Name')]
    amount: Annotated[float, Field(..., title='Deal Amount')]
    stage: Annotated[str, Field(..., title='Deal Stage')]
    date: Annotated[datetime, Field(..., title='Deal Date')]
    contact: Annotated[str, Field(..., min_length=10, max_length=15, title='Customer Contact', pattern=r'^\d{10,15}$')]

