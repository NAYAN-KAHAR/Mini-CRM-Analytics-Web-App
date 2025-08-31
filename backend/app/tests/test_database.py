
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from ..database import Base  

TEST_SQLALCHEMY_DATABASE_URL = "sqlite+aiosqlite:///./test_blog.db"

test_engine = create_async_engine(TEST_SQLALCHEMY_DATABASE_URL, echo=True)

TestAsyncSessionLocal = sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

async def get_test_db():
    async with TestAsyncSessionLocal() as session:
        yield session
