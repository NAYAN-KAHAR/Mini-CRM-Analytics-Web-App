from pydantic import BaseModel, Field, EmailStr
from typing import Annotated

class UserSchema(BaseModel):
   email: Annotated[EmailStr, Field(..., title='User Email')]
   password: Annotated[str, Field(..., max_length=128, title='User Password')]
