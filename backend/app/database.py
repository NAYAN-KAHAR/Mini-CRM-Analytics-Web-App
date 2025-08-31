
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base

# ✅ 1. Use async driver in database URL
SQLALCHEMY_DATABASE_URL = "sqlite+aiosqlite:///./blog.db"

# ✅ 2. Create an async engine
engine = create_async_engine(SQLALCHEMY_DATABASE_URL,echo=True)
  

# ✅ 3. Create async session maker
AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False 
)

# ✅ 4. Declare base
Base = declarative_base()

# ✅ 5. Dependency Injection to get async session in FastAPI routes
async def get_db():
    async with AsyncSessionLocal() as session:
        print("database connected")
        yield session
        

# AsyncSessionLocal = sessionmaker(
#     bind=engine,               # 1. Required - binds the session to the DB engine
#     class_=AsyncSession,       # 2. Required - tells sessionmaker to create async sessions
#     expire_on_commit=False,    # 3. Optional - controls if ORM objects expire after commit
#     autoflush=False,           # 4. Optional - controls if changes are flushed automatically before queries
#     autocommit=False           # 5. Deprecated/ignored - SQLAlchemy 1.4+ manages transactions explicitly
# )