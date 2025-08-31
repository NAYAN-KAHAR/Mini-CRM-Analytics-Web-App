import pytest
from httpx import AsyncClient
from datetime import datetime  

from app.main import app
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db, Base
from app.tests.test_database import get_test_db, test_engine

import io


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
        "name": "Test Deal 1",
        "amount": 1500.0,
        "stage": "Prospect",
        "date": datetime.now().isoformat(),
        "contact": "9991112220"
    }

    create_response = await async_client.post("/api/post/deals-contacts", json=payload)
    assert create_response.status_code == 201
    assert create_response.json()["message"] == "deal created successful"

    get_response = await async_client.get("/api/get/deals-contacts")
    assert get_response.status_code == 200

    deals = get_response.json()
    assert "data" in deals
    assert isinstance(deals["data"], list)
    assert any(d["contact"] == payload["contact"] for d in deals["data"])


@pytest.mark.anyio
async def test_update_deal(async_client: AsyncClient):
    payload = {
        "name": "Test Deal 2",
        "amount": 2000.0,
        "stage": "Convert",
        "date": datetime.now().isoformat(),
        "contact": "9991112221"
    }

    # Create deal
    create_response = await async_client.post("/api/post/deals-contacts", json=payload)
    assert create_response.status_code == 201

    # Get deal to extract ID
    get_response = await async_client.get("/api/get/deals-contacts")
    assert get_response.status_code == 200

    deals = get_response.json()["data"]
    deal = next((d for d in deals if d["contact"] == payload["contact"]), None)
    assert deal is not None

    deal_id = deal["id"]

    # Update payload
    updated_payload = payload.copy()
    updated_payload["stage"] = "Closed-Won"

    update_response = await async_client.put(f"/api/contacts-deal-update/{deal_id}", json=updated_payload)
    assert update_response.status_code == 200
    assert update_response.json()["message"] == "Customer updated successfully!"


@pytest.mark.anyio
async def test_delete_deal(async_client: AsyncClient):
    payload = {
        "name": "Test Deal 3",
        "amount": 2500.0,
        "stage": "Lead",
        "date": datetime.now().isoformat(),
        "contact": "9991112222"
    }

    # Create deal
    create_response = await async_client.post("/api/post/deals-contacts", json=payload)
    assert create_response.status_code == 201

    # Get deal
    get_response = await async_client.get("/api/get/deals-contacts")
    assert get_response.status_code == 200

    deals = get_response.json()["data"]
    deal = next((d for d in deals if d["contact"] == payload["contact"]), None)
    assert deal is not None

    deal_id = deal["id"]

    # Delete 
    delete_response = await async_client.delete(f"/api/deals-delete/{deal_id}")
    assert delete_response.status_code == 200



@pytest.mark.anyio
async def test_upload_deals_csv(async_client: AsyncClient):
    csv_content = (
        "Customer,Amount,Stage,Date,Contact\n"
        "CSV Deal 1,1200.50,Prospect,2025-08-31,8881112223\n"
        "CSV Deal 2,2300.00,Negotiation,2025-08-30,8881112224\n"
    )
    file = {"file": ("deals.csv", csv_content, "text/csv")}
    
    response = await async_client.post("/api/upload/deal-customers-csv", files=file)
    assert response.status_code == 200
    assert "2 customers added" in response.text



@pytest.mark.anyio
async def test_export_deals_csv(async_client: AsyncClient):
    response = await async_client.get("/api/export/deal-customers")
    assert response.status_code == 200
    assert "text/csv" in response.headers["content-type"]
    content = response.text

    # Check if CSV header exists
    assert "Name,Stage,Amount,Contact,Date" in content
