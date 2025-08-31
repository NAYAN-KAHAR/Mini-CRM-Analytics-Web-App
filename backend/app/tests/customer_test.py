import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.main import app
from app.database import get_db
from app.database import Base
from app.tests.test_database import get_test_db, test_engine

# DB setup
@pytest.fixture(scope="module", autouse=True)
async def setup_database():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture(scope="module")
def anyio_backend():
    return "asyncio"


@pytest.fixture(scope="module")
async def async_client():
    app.dependency_overrides[get_db] = get_test_db
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client
    app.dependency_overrides.clear()



@pytest.mark.anyio
async def test_create_customer(async_client: AsyncClient):
    payload = {
        "name": "Alice",
        "email": "alice@example.com",
        "phone": "1234567890",
        "company": "Acme Inc."
    }
    response = await async_client.post("/api/post/contact", json=payload)
    assert response.status_code == 201
    assert "customer created successful" in response.text



@pytest.mark.anyio
async def test_create_duplicate_customer(async_client: AsyncClient):
    payload = {
        "name": "Alice",
        "email": "alice@example.com",
        "phone": "1234567890",
        "company": "Acme Inc."
    }
    response = await async_client.post("/api/post/contact", json=payload)
    assert response.status_code == 400



@pytest.mark.anyio
async def test_get_customers(async_client: AsyncClient):
    response = await async_client.get("/api/get/contacts")
    assert response.status_code == 200
    customers = response.json()
    assert isinstance(customers, list)
    assert customers[0]["email"] == "alice@example.com"



@pytest.mark.anyio
async def test_update_customer(async_client: AsyncClient):
    update_data = {
        "name": "Alice Updated",
        "email": "alice_updated@example.com",
        "phone": "0987654321",
        "company": "Updated Inc."
    }
    response = await async_client.put("/api/contacts-update/1", json=update_data)
    assert response.status_code == 200



@pytest.mark.anyio
async def test_delete_customer(async_client: AsyncClient):
    response = await async_client.delete("/api/contacts-delete/1")
    assert response.status_code == 200



@pytest.mark.anyio
async def test_csv_upload_and_export(async_client: AsyncClient):
    # Create CSV 
    csv_content = (
        "name,email,phone,company\n"
        "Bob,bob@example.com,1112223333,Bob Co.\n"
        "Charlie,charlie@example.com,2223334444,Charlie Co.\n"
    )

    # Upload CSV
    files = {"file": ("customers.csv", csv_content, "text/csv")}
    upload_response = await async_client.post("/api/upload/customers-csv", files=files)
    assert upload_response.status_code == 200
    assert "2 customers added" in upload_response.text

    # Export CSV
    export_response = await async_client.get("/api/export/contacts")
    assert export_response.status_code == 200
    assert "text/csv" in export_response.headers["content-type"]
