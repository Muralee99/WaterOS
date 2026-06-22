import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_health_check():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data


@pytest.mark.asyncio
async def test_metrics():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "active_agents" in data


@pytest.mark.asyncio
async def test_mcp_tools_list():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Unauthorized should fail
        response = await client.get("/api/v1/mcp/tools")
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_login_with_bad_credentials():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post(
            "/api/v1/auth/login",
            json={"email": "bad@example.com", "password": "wrong"},
        )
    assert response.status_code == 401
