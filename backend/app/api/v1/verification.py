
"""
Email Deliverability Verification Router.

The provider integration is not configured yet, so this endpoint
must not claim that an email is deliverable.
"""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends

from backend.app.core.security import require_roles

router = APIRouter(prefix="/leads", tags=["Verification"])


@router.post("/{id}/verify")
def verify_contact_email(
    id: str,
    current_user: dict = Depends(
        require_roles(["admin", "researcher"])
    ),
):
    """Report verification as unavailable until a provider is configured."""
    return {
        "status": "not_configured",
        "result": "unknown",
        "score_impact": "+0 points",
        "checked_at": datetime.now(timezone.utc).isoformat(),
    }
