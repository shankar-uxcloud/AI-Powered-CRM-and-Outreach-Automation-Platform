
"""Contact CRUD API endpoints."""

from datetime import datetime
from typing import Optional
from uuid import UUID


from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from psycopg.errors import ForeignKeyViolation
from backend.app.repositories import contacts_repo

router = APIRouter(prefix="/contacts", tags=["Contacts"])


class ContactCreate(BaseModel):
    organization_id: UUID
    name: str = Field(min_length=1, max_length=255)
    role_title: Optional[str] = Field(default=None, max_length=255)


class ContactUpdate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    role_title: Optional[str] = Field(default=None, max_length=255)


class ContactResponse(BaseModel):
    id: UUID
    organization_id: UUID
    name: str
    role_title: Optional[str] = None
    created_at: datetime
    updated_at: datetime


@router.post(
    "",
    response_model=ContactResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_contact(payload: ContactCreate):
    try:
        return contacts_repo.create_contact(
            organization_id=payload.organization_id,
            name=payload.name,
            role_title=payload.role_title,
        )
    except ForeignKeyViolation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found.",
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to create contact.",
        )


@router.get("/{contact_id}", response_model=ContactResponse)
def get_contact(contact_id: UUID):
    contact = contacts_repo.get_contact_by_id(contact_id)

    if contact is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found.",
        )

    return contact


@router.put("/{contact_id}", response_model=ContactResponse)
def update_contact(contact_id: UUID, payload: ContactUpdate):
    contact = contacts_repo.update_contact(
        contact_id=contact_id,
        name=payload.name,
        role_title=payload.role_title,
    )

    if contact is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found.",
        )

    return contact


@router.delete("/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_contact(contact_id: UUID):
    deleted = contacts_repo.delete_contact(contact_id)

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found.",
        )

    return None
