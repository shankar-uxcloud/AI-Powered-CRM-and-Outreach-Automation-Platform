import React, { useState } from 'react'

const VERIFICATION_STATUSES = {
  deliverable: {
    label: 'Deliverable',
    description: 'Email appears deliverable',
    variant: 'success'
  },
  undeliverable: {
    label: 'Undeliverable',
    description: 'Email cannot be delivered',
    variant: 'danger'
  },
  catch_all: {
    label: 'Catch-All',
    description: 'Domain accepts catch-all emails',
    variant: 'warning'
  },
  risky: {
    label: 'Risky',
    description: 'Email may have delivery risks',
    variant: 'warning'
  },
  not_configured: {
    label: 'Not configured',
    description: 'Email verification service is not configured',
    variant: 'neutral'
  },
  unknown: {
    label: 'Unknown',
    description: 'Email verification is inconclusive',
    variant: 'neutral'
  },
  failed: {
    label: 'Verification Failed',
    description: 'Verification could not be completed',
    variant: 'danger'
  }
}

const CHIP_STYLES = {
  success: {
    background: '#dcfce7',
    color: '#166534',
    border: '#86efac'
  },
  danger: {
    background: '#fee2e2',
    color: '#991b1b',
    border: '#fca5a5'
  },
  warning: {
    background: '#fef3c7',
    color: '#92400e',
    border: '#fcd34d'
  },
  neutral: {
    background: '#f3f4f6',
    color: '#374151',
    border: '#d1d5db'
  }
}

function normalizeStatus(status) {
  const normalized = String(status || 'unknown')
    .toLowerCase()
    .replace(/[\s-]+/g, '_')

  if (normalized === 'verification_failed') return 'failed'

  return VERIFICATION_STATUSES[normalized]
    ? normalized
    : 'unknown'
}

function formatVerificationTime(verifiedAt, now = Date.now()) {
  if (!verifiedAt) return 'Not verified yet'

  const timestamp = new Date(verifiedAt).getTime()

  if (!Number.isFinite(timestamp) || timestamp > now) {
    return 'Verification time unavailable'
  }

  const elapsed = now - timestamp
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (elapsed < minute) return 'Verified just now'

  if (elapsed < hour) {
    const minutes = Math.floor(elapsed / minute)
    return `Verified ${minutes} minute${minutes === 1 ? '' : 's'} ago`
  }

  if (elapsed < day) {
    const hours = Math.floor(elapsed / hour)
    return `Verified ${hours} hour${hours === 1 ? '' : 's'} ago`
  }

  const days = Math.floor(elapsed / day)

  if (days < 30) {
    return `Verified ${days} day${days === 1 ? '' : 's'} ago`
  }

  const months = Math.floor(days / 30)

  if (months < 12) {
    return `Verified ${months} month${months === 1 ? '' : 's'} ago`
  }

  const years = Math.floor(days / 365)
  return `Verified ${years} year${years === 1 ? '' : 's'} ago`
}

export function VerificationChips({
  status = 'unknown',
  verifiedAt = null,
  className = ''
}) {
  const normalizedStatus = normalizeStatus(status)
  const verification = VERIFICATION_STATUSES[normalizedStatus]
  const chipStyle = CHIP_STYLES[verification.variant]

  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 6
      }}
    >
      <span
        role="status"
        aria-label={`Email verification: ${verification.label}. ${verification.description}`}
        title={verification.description}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '4px 10px',
          borderRadius: 999,
          border: `1px solid ${chipStyle.border}`,
          backgroundColor: chipStyle.background,
          color: chipStyle.color,
          fontSize: 12,
          fontWeight: 600,
          lineHeight: 1.4
        }}
      >
        {verification.label}
      </span>

      <span style={{ fontSize: 12, color: '#6b7280' }}>
        {verification.description}
      </span>

      <span style={{ fontSize: 12, color: '#6b7280' }}>
        {formatVerificationTime(verifiedAt)}
      </span>
    </div>
  )
}

export function VerifyEmailButton({
  leadId,
  selectedLeadIds = [],
  onVerify,
  onError,
  disabled = false
}) {
  const [loading, setLoading] = useState(false)

  const batchIds = Array.isArray(selectedLeadIds)
    ? selectedLeadIds.filter(Boolean)
    : []

  const isBatch = batchIds.length > 0
  const hasTarget = isBatch || Boolean(leadId)
  const isDisabled = disabled || loading || !hasTarget || !onVerify

  async function handleVerify() {
    if (isDisabled) return

    setLoading(true)

    try {
      if (isBatch) {
        await onVerify({ leadIds: batchIds })
      } else {
        await onVerify({ leadId })
      }
    } catch (error) {
      if (onError) {
        onError(error)
      } else {
        console.error('Email verification failed:', error)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>
        {`
          @keyframes verification-spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>

      <button
        type="button"
        onClick={handleVerify}
        disabled={isDisabled}
        aria-busy={loading}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          padding: '8px 14px',
          border: '1px solid #2563eb',
          borderRadius: 6,
          background: isDisabled ? '#9ca3af' : '#2563eb',
          color: '#ffffff',
          fontSize: 14,
          fontWeight: 600,
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          opacity: isDisabled ? 0.8 : 1
        }}
      >
        {loading && (
          <span
            aria-hidden="true"
            style={{
              width: 14,
              height: 14,
              border: '2px solid rgba(255,255,255,0.45)',
              borderTopColor: '#ffffff',
              borderRadius: '50%',
              animation: 'verification-spin 0.7s linear infinite'
            }}
          />
        )}

        {loading
          ? 'Verifying...'
          : isBatch
            ? `Verify ${batchIds.length} selected`
            : 'Verify Email'}
      </button>

      <span
        role="status"
        aria-live="polite"
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0
        }}
      >
        {loading ? 'Email verification in progress' : ''}
      </span>
    </>
  )
}

export default VerificationChips
