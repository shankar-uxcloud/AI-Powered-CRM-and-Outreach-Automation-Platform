
"""Database operations for contacts."""

from backend.app.core.db import get_conn


def create_contact(organization_id, name, role_title=None):
    """Create a contact and return the created record."""
    query = """
        INSERT INTO contacts (organization_id, name, role_title)
        VALUES (%s, %s, %s)
        RETURNING id, organization_id, name, role_title, created_at, updated_at
    """

    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(query, (str(organization_id), name, role_title))
            row = cur.fetchone()
            columns = [desc.name for desc in cur.description]
            return dict(zip(columns, row))


def get_contact_by_id(contact_id):
    """Return a contact by ID, or None if it does not exist."""
    query = """
        SELECT id, organization_id, name, role_title, created_at, updated_at
        FROM contacts
        WHERE id = %s
    """

    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(query, (str(contact_id),))
            row = cur.fetchone()

            if row is None:
                return None

            columns = [desc.name for desc in cur.description]
            return dict(zip(columns, row))


def update_contact(contact_id, name, role_title):
    """Update a contact and return the updated record."""
    query = """
        UPDATE contacts
        SET name = %s,
            role_title = %s,
            updated_at = NOW()
        WHERE id = %s
        RETURNING id, organization_id, name, role_title, created_at, updated_at
    """

    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(query, (name, role_title, str(contact_id)))
            row = cur.fetchone()

            if row is None:
                return None

            columns = [desc.name for desc in cur.description]
            return dict(zip(columns, row))


def delete_contact(contact_id):
    """Delete a contact. Return True if a record was deleted."""
    query = "DELETE FROM contacts WHERE id = %s RETURNING id"

    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(query, (str(contact_id),))
            return cur.fetchone() is not None
