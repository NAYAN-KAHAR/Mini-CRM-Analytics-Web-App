import pytest
from httpx import AsyncClient
from datetime import datetime  

from app.main import app
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db, Base
from app.tests.test_database import get_test_db, test_engine

# Test DB setup
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
async def test_create_and_get_deal(async_client: AsyncClient):
    payload = {
    "name": "Test Customer",
    "amount": 1500.0,
    "stage": "Prospect",
    "date": datetime.now().isoformat(),
     "contact": "8765432109"
  }

    create_response = await async_client.post("/api/post/deals-contacts", json=payload)
    assert create_response.status_code == 201
    assert create_response.json()["message"] == "deal created successful"

    get_response = await async_client.get("/api/get/deals-contacts")
    assert get_response.status_code == 200
    deals = get_response.json()
    assert any(d["contact"] == payload["contact"] for d in deals)



@pytest.mark.anyio
async def test_update_deal(async_client: AsyncClient):
    payload = {
    "name": "Test Customer",
    "amount": 1500.0,
    "stage": "Closed Won",
    "date": datetime.now().isoformat(),
     "contact": "8765432109"
   }

    response = await async_client.post("/api/post/deals-contacts", json=payload)
    assert response.status_code == 201

    get_response = await async_client.get("/api/get/deals-contacts")
    deal = next((d for d in get_response.json() if d["contact"] == payload["contact"]), None)
    assert deal is not None
    deal_id = deal["id"]

    updated_payload = payload.copy()
    updated_payload["stage"] = "Closed-Won"

    update_response = await async_client.put(f"/api/contacts-deal-update/{deal_id}", json=updated_payload)
    assert update_response.status_code == 200
    assert update_response.json()["message"] == "Customer updated successfully!"



@pytest.mark.anyio
async def test_delete_deal(async_client: AsyncClient):
    payload = {
    "name": "Test Customer",
    "amount": 1500.0,
    "stage": "Lead",
    "date": datetime.now().isoformat(),
     "contact": "8765432109"
  }

    response = await async_client.post("/api/post/deals-contacts", json=payload)
    assert response.status_code == 201

    get_response = await async_client.get("/api/get/deals-contacts")
    deal = next((d for d in get_response.json() if d["contact"] == payload["contact"]), None)
    assert deal is not None
    deal_id = deal["id"]

    delete_response = await async_client.delete(f"/api/deals-delete/{deal_id}")
    assert delete_response.status_code == 200
