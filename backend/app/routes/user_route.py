

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.future import select

from ..database import get_db  
from ..models.user_model import User
from ..schemas.user_schema import UserSchema
import bcrypt 



router = APIRouter()



# user  signup
@router.post("/api/auth/signup")
async def first_api(user_data: UserSchema, db: AsyncSession  = Depends(get_db)):
    try:
       result = await db.execute(select(User).where(User.email == user_data.email))
       exits_user = result.scalars().first()

       if exits_user:
           raise HTTPException(status_code=400, detail="User already exist.")

         # Hash the password
       hashed_password = bcrypt.hashpw(user_data.password.encode('utf-8'), bcrypt.gensalt())
       
       new_user = User(
         email = user_data.email,
         password=hashed_password.decode('utf-8')   
        ) 
       db.add(new_user)
       await db.commit()
       await db.refresh(new_user)

       return JSONResponse( status_code=201,
             content={
                 "message": "Signup successful",
                 "data": {
                      "id": new_user.id,
                      "email": new_user.email
                     }
                }
            )

    
    except SQLAlchemyError as e:
        print("Error during signup:", str(e))
        raise HTTPException(status_code=500, detail="Internal Server Error.")




# user login logic
@router.post("/api/auth/login")
async def first_api(user_data: UserSchema, db:AsyncSession = Depends(get_db)):
    try:
        # 1. Check if user exists
        result = await db.execute(select(User).where(User.email == user_data.email))
        user = result.scalars().first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found.")

        # 2. Compare password (not hash again!)
        if not bcrypt.checkpw(user_data.password.encode('utf-8'), user.password.encode('utf-8')):
            raise HTTPException(status_code=401, detail="Incorrect password.")

        # 3. Return success response
        return JSONResponse( status_code=200, content={"message": "Login successful", "user_id": user.id})

    
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Internal Server Error.")




@router.get("/api/users")
async def get_all_users(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User))
    users = result.scalars().all() 
    return [
        {
            "id": user.id,
            "email": user.email,
            "password": user.password  # Don't expose this in real apps
        }
        for user in users
    ]
