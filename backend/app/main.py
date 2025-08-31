
from fastapi import FastAPI
from .routes import user_route, customer_route,deal_route  
from fastapi.middleware.cors import CORSMiddleware
from .database import Base,engine

from .models.deals_model  import DealsCustomer  # <-- Import your DealsCustomer model here

from sqlalchemy import text
from contextlib import asynccontextmanager


from .models.deals_model import DealsCustomer
from contextlib import asynccontextmanager
from sqlalchemy.exc import SQLAlchemyError


# ✅ Define lifespan BEFORE using it
@asynccontextmanager
async def lifespan(app: FastAPI):
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
  

app = FastAPI(lifespan=lifespan)


# 👇 Add CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],
)






app.include_router(user_route.router)
app.include_router(customer_route.router) 
app.include_router(deal_route.router) 


