from pydantic import BaseModel, Field, EmailStr
from typing import Annotated

class CustomerSchema(BaseModel):
   name: Annotated[str, Field(..., title='Customer Name')]
   email: Annotated[EmailStr, Field(..., title='Customer Email')]
   phone: Annotated[str, Field(..., max_length=10, title='Customer Phone')]
   company: Annotated[str, Field(..., title='Customer Company')]