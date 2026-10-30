# Frontend Developer Guide

Welcome to the frontend team! This guide covers everything you need to know to build, test, and ship components and pages for the CRM dashboard.

---

## 1. Tech Stack & Key Choices

- **Build Tool**: Vite (fast HMR, lightweight output)
- **Framework**: React 18+
- **Styling**: Standard CSS with Design Tokens (`tokens.css`, `global.css`). No bloated CSS frameworks.
- **Mocking**: MSW (Mock Service Worker) & fixtures so you can build complete features without waiting for backend APIs.
- **Testing**: Vitest + React Testing Library.

---

## 2. Directory Structure

```
frontend/
├── package.json          # (LEAD-ONLY) Root dependencies
├── vite.config.js        # Vite config with proxy settings
├── public/
│   └── _redirects        # Cloudflare Pages SPA routing rewrite rules
└── src/
    ├── main.jsx          # Entry point
    ├── App.jsx           # Router & layout provider
    ├── styles/
    │   ├── tokens.css    # Design tokens (colors, spacing, score bands)
    │   └── global.css    # Reset and typography
    ├── api/
    │   ├── client.js     # Shared fetch wrapper (JWT, X-Correlation-ID, error handling)
    │   └── leads.js      # Leads API client
    ├── mocks/
    │   ├── handlers.js   # MSW mock handlers
    │   └── sampleLeads.js# Fake leads fixture
    ├── components/
    │   ├── ui/           # Button, Input, Modal, Table, Badge
    │   ├── layout/       # Sidebar, Header
    │   ├── score/        # ScoreBadge
    │   ├── verification/ # VerificationStatusChip
    │   └── feedback/     # Spinner, EmptyState, ErrorBanner
    └── pages/
        ├── _Kitchen/     # Component kit showcase / test harness
        ├── Login/
        ├── LeadPipeline/ # Main CRM table & Kanban
        ├── MyLeads/      # Assigned / claimed leads
        ├── EnrichmentQueue/
        ├── CampaignManager/
        ├── Suppression/
        ├── SystemHealth/
        └── ErrorCenter/
```

---

## 3. Getting Started Locally

```bash
cd frontend
npm install
npm run dev
```

The application will be running at `http://localhost:5173`.
By default, `VITE_USE_MOCKS=true` in `.env`, allowing you to develop fully offline against mock data.

---

## 4. UI Kit & The Kitchen Sink Demo (`/_Kitchen`)

Whenever you build or test a UI component (`Button`, `Input`, `Modal`, `Badge`, `Table`), always add its variants to `src/pages/_Kitchen/index.jsx`.
This serves as our live design system gallery.

### Design Tokens
Colors, score bands, and radii are defined in `src/styles/tokens.css`:
- High Confidence: `var(--color-score-high)` (Green)
- Medium Confidence: `var(--color-score-medium)` (Amber)
- Low Confidence: `var(--color-score-low)` (Red)
- Primary Accent: `var(--color-primary)`

---

## 5. Working Rules Reminder for Frontend Interns

1. Check your assigned Task ID in the [Tasksheet](tasksheet.md) (e.g. `FE-04`, `FE-09`).
2. Only edit files assigned to your ticket.
3. Do not modify `package.json` — if you need a library, open a **Library Request** issue.
4. Always test keyboard accessibility (tab focus, Escape key to close modals).
5. Attach a screenshot or video recording to your Pull Request!

---

## 6. FE-23: Campaign Approval Screen

- **Component**: `frontend/src/pages/CampaignManager/Approval.jsx`
- **Route**: `/campaigns/approval`
- **Purpose**: Pre-send human-in-the-loop audit screen that enforces deliverability verification, subject/body validity, suppression checks, and send limit enforcement prior to locking content for dispatch.

### Pre-Send Checklist Validation
1. **Recipient Deliverability**: Verifies deliverability status is strictly `deliverable`. Risky, catch-all, undeliverable, or unknown statuses fail.
2. **Subject Validity**: Enforces non-empty string and 1..80 character limit matching the `AIDraftOutput` contract.
3. **Body Validity**: Enforces non-empty message body.
4. **Suppression Check**: Validates recipient email and domain against `GET /suppression`.
5. **Daily Send Limit**: Verifies quota availability (`remaining = dailyLimit - sentToday > 0`).

### Content Locking (`POST /approvals`)
- Calls `POST /approvals` with `{ draft_id, approved: true, edited_subject, edited_body }`.
- On server confirmation, stores the immutable SHA-256 `content_hash` and renders the preview in a locked, read-only state.
- Dispatches are never triggered automatically (human approval only).

### Known Architectural Blockers
1. **Approval Revocation Not Supported in Backend API**:
   - `database/migrations/005_campaigns_drafts_approvals.sql` defines a `revoked_at` column, but `backend/app/api/v1/approvals.py` and `contracts/openapi.yaml` do not expose a revocation route (e.g. `DELETE /approvals/{id}`).
   - The UI correctly catches this and reports it as a blocker rather than simulating fake persistent revocation.
2. **Missing Upstream Prerequisite FE-22**:
   - Official FE-22 (`DraftEditor.jsx`) is not yet completed in the upstream integration branch.
   - `Approval.jsx` accepts `{ draftId, recipient, subject, body }` via props or router state to facilitate clean plug-and-play integration as soon as official FE-22 is merged.
