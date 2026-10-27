
"""Tests for the email verification endpoint."""

def get_token(client, email, password="Password123!"):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    assert response.status_code == 200
    return response.json()["access_token"]


def test_admin_verification_does_not_claim_delivery(client):
    token = get_token(client, "admin@example.com")

    response = client.post(
        "/api/v1/leads/test-lead/verify",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "not_configured"
    assert data["result"] == "unknown"
    assert data["score_impact"] == "+0 points"
    assert "checked_at" in data


def test_researcher_can_request_verification(client):
    token = get_token(client, "researcher@example.com")

    response = client.post(
        "/api/v1/leads/test-lead/verify",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    assert response.json()["result"] == "unknown"


def test_campaign_manager_cannot_verify(client):
    token = get_token(client, "campaigns@example.com")

    response = client.post(
        "/api/v1/leads/test-lead/verify",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 403


def test_verification_requires_authentication(client):
    response = client.post("/api/v1/leads/test-lead/verify")

    assert response.status_code in (401, 403)
