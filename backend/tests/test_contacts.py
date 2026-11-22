
from datetime import datetime, timezone
from uuid import UUID

from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.repositories import contacts_repo


client = TestClient(app)

CONTACT_ID = "c0000001-0000-0000-0000-000000000001"
ORG_ID = "a0000001-0000-0000-0000-000000000001"

SAMPLE_CONTACT = {
    "id": UUID(CONTACT_ID),
    "organization_id": UUID(ORG_ID),
    "name": "Test Contact",
    "role_title": "HR Manager",
    "created_at": datetime.now(timezone.utc),
    "updated_at": datetime.now(timezone.utc),
}


def test_create_contact(monkeypatch):
    def mock_create_contact(**kwargs):
        return {**SAMPLE_CONTACT, **kwargs}

    monkeypatch.setattr(
        contacts_repo, "create_contact", mock_create_contact
    )

    response = client.post(
        "/api/v1/contacts",
        json={
            "organization_id": ORG_ID,
            "name": "Test Contact",
            "role_title": "HR Manager",
        },
    )

    assert response.status_code == 201
    assert response.json()["name"] == "Test Contact"


def test_create_contact_invalid_data():
    response = client.post(
        "/api/v1/contacts",
        json={"organization_id": ORG_ID},
    )

    assert response.status_code == 422


def test_get_contact(monkeypatch):
    monkeypatch.setattr(
        contacts_repo, "get_contact_by_id",
        lambda contact_id: SAMPLE_CONTACT,
    )

    response = client.get(f"/api/v1/contacts/{CONTACT_ID}")

    assert response.status_code == 200
    assert response.json()["id"] == CONTACT_ID


def test_get_contact_not_found(monkeypatch):
    monkeypatch.setattr(
        contacts_repo, "get_contact_by_id",
        lambda contact_id: None,
    )

    response = client.get(f"/api/v1/contacts/{CONTACT_ID}")

    assert response.status_code == 404


def test_update_contact(monkeypatch):
    def mock_update_contact(contact_id, name, role_title):
        return {
            **SAMPLE_CONTACT,
            "name": name,
            "role_title": role_title,
        }

    monkeypatch.setattr(
        contacts_repo, "update_contact", mock_update_contact
    )

    response = client.put(
        f"/api/v1/contacts/{CONTACT_ID}",
        json={
            "name": "Updated Contact",
            "role_title": "Talent Manager",
        },
    )

    assert response.status_code == 200
    assert response.json()["name"] == "Updated Contact"


def test_update_contact_not_found(monkeypatch):
    monkeypatch.setattr(
        contacts_repo, "update_contact",
        lambda **kwargs: None,
    )

    response = client.put(
        f"/api/v1/contacts/{CONTACT_ID}",
        json={"name": "Updated Contact"},
    )

    assert response.status_code == 404


def test_delete_contact(monkeypatch):
    monkeypatch.setattr(
        contacts_repo, "delete_contact",
        lambda contact_id: True,
    )

    response = client.delete(f"/api/v1/contacts/{CONTACT_ID}")

    assert response.status_code == 204


def test_delete_contact_not_found(monkeypatch):
    monkeypatch.setattr(
        contacts_repo, "delete_contact",
        lambda contact_id: False,
    )

    response = client.delete(f"/api/v1/contacts/{CONTACT_ID}")

    assert response.status_code == 404


def test_invalid_contact_id():
    response = client.get("/api/v1/contacts/invalid-id")

    assert response.status_code == 422
