
import pytest
from httpx import AsyncClient
from httpx import ASGITransport  

from app.main import app
from app.database import get_db  # original dependency

from app.tests.test_database import get_test_db, test_engine
from app.database import Base

@pytest.fixture(scope="module", autouse=True)
async def prepare_test_database():
    # Create tables in test DB before tests run
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Drop tables after tests finish
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest.fixture(scope="module")
def anyio_backend():
    return "asyncio"

@pytest.fixture(scope="module")
async def async_client():

    # Override the get_db dependency to use test DB session
    app.dependency_overrides[get_db] = get_test_db

    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()



@pytest.mark.anyio
async def test_signup_login(async_client):
    # signup
    response = await async_client.post("/api/auth/signup", json={
        "email": "test@example.com",
        "password": "testpassword"
    })
    assert response.status_code == 201
    assert "Signup successful" in response.text

    # duplicate signup fails
    response = await async_client.post("/api/auth/signup", json={
        "email": "test@example.com",
        "password": "testpassword"
    })
    assert response.status_code == 400

    # login
    response = await async_client.post("/api/auth/login", json={
        "email": "test@example.com",
        "password": "testpassword"
    })
    assert response.status_code == 200
    assert "Login successful" in response.text
