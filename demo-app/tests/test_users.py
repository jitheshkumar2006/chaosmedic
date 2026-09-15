import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.user_service import deactivate_chaos

@pytest.fixture(autouse=True)
def reset_chaos():
    deactivate_chaos()
    yield
    deactivate_chaos()

@pytest.mark.anyio
async def test_health_returns_200():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/health")
        assert response.status_code == 200

@pytest.mark.anyio
async def test_health_has_status_field():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/health")
        data = response.json()
        assert "status" in data

@pytest.mark.anyio
async def test_health_status_is_healthy():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/health")
        data = response.json()
        assert data["status"] == "healthy"

@pytest.mark.anyio
async def test_get_users_returns_200():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/users")
        assert response.status_code == 200

@pytest.mark.anyio
async def test_get_users_returns_list():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/users")
        data = response.json()
        assert isinstance(data, list)

@pytest.mark.anyio
async def test_get_users_has_correct_count():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/users")
        data = response.json()
        assert len(data) == 5

@pytest.mark.anyio
async def test_user_has_name_field():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/users")
        data = response.json()
        assert "name" in data[0]

@pytest.mark.anyio
async def test_user_has_email_field():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/users")
        data = response.json()
        assert "email" in data[0]

@pytest.mark.anyio
async def test_user_has_role_field():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/users")
        data = response.json()
        assert "role" in data[0]

@pytest.mark.anyio
async def test_user_has_id_field():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/users")
        data = response.json()
        assert "id" in data[0]

@pytest.mark.anyio
async def test_user_name_is_uppercase():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/users")
        data = response.json()
        assert data[0]["name"] == data[0]["name"].upper()

@pytest.mark.anyio
async def test_user_email_contains_at():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/users")
        data = response.json()
        assert "@" in data[0]["email"]

@pytest.mark.anyio
async def test_get_user_by_id_returns_200():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/users/1")
        assert response.status_code == 200

@pytest.mark.anyio
async def test_get_user_by_id_returns_correct_user():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/users/1")
        data = response.json()
        assert data["id"] == 1

@pytest.mark.anyio
async def test_get_user_by_invalid_id_returns_404():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/users/999")
        assert response.status_code == 404

@pytest.mark.anyio
async def test_chaos_status_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/chaos/status")
        assert response.status_code == 200
        assert response.json()["chaos_active"] is False

@pytest.mark.anyio
async def test_source_endpoint_returns_code():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/source/user_service.py")
        assert response.status_code == 200
        assert "def get_users():" in response.text

@pytest.mark.anyio
async def test_source_endpoint_invalid_file_returns_404():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/source/invalid.py")
        assert response.status_code == 404
