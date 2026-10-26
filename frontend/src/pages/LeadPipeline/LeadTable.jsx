import React from 'react'
import { Table, Badge } from '../../components/ui/Badge'
import { ScoreBadge } from '../../components/score/ScoreBadge'
import { Button } from '../../components/ui/Button'
import {
  VerificationChips,
  VerifyEmailButton
} from '../../components/verification/VerificationChips'
export function LeadTable({
  leads = [],
  onSelectLead,
  onClaimLead,
  currentUserId,
  verificationResults = {},
  onVerifyEmail,
  onVerificationError
}) {
  const headers = [
    'Organization',
    'Role Title',
    'Source',
    'Experience',
    'Quality Score',
    'Status',
    'Assigned To',
    'Actions'
  ]

  return (
    <Table headers={headers}>
      {leads.map((lead) => {
        const isClaimedByMe = lead.assigned_to === currentUserId
        const isClaimedByOther = lead.assigned_to && !isClaimedByMe

        return (
          <tr
            key={lead.id}
            onClick={() => onSelectLead && onSelectLead(lead)}
            style={{
              cursor: 'pointer',
              borderBottom: '1px solid var(--color-border)',
              transition: 'background-color 0.1s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg-subtle)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <td style={{ padding: '12px 16px', fontWeight: 600 }}>
              {lead.organization_name}
            </td>
            <td style={{ padding: '12px 16px' }}>
              <div style={{ fontWeight: 500 }}>{lead.title}</div>
              {lead.location && (
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>📍 {lead.location}</div>
              )}
            </td>
            <td style={{ padding: '12px 16px' }}>
              <Badge variant="info">{lead.source_name}</Badge>
            </td>
            <td style={{ padding: '12px 16px', fontSize: '13px' }}>
              {lead.experience_max !== null && lead.experience_max !== undefined
                ? `${lead.experience_min || 0}-${lead.experience_max} yrs`
                : 'Fresher'}
            </td>
            <td style={{ padding: '12px 16px' }}>
              <ScoreBadge score={lead.score} band={lead.score_band} />
            </td>
            <td style={{ padding: '12px 16px' }}>
              <span style={{ fontSize: '13px', textTransform: 'capitalize' }}>
                {lead.status.replace('_', ' ')}
              </span>
            </td>
            <td
  style={{ padding: '12px 16px' }}
  onClick={(e) => e.stopPropagation()}
>
  {!lead.assigned_to && onClaimLead && (
    <Button
      variant="secondary"
      onClick={() => onClaimLead(lead.id)}
      style={{ fontSize: '12px', padding: '4px 8px' }}
    >
      Claim
    </Button>
  )}

  <div style={{ marginTop: 8 }}>
    <VerifyEmailButton
      leadId={lead.id}
      onVerify={onVerifyEmail}
      onError={onVerificationError}
    />
  </div>

  <div style={{ marginTop: 8 }}>
    <VerificationChips
      status={verificationResults[lead.id]?.status || 'unknown'}
      verifiedAt={verificationResults[lead.id]?.verifiedAt || null}
    />
  </div>
</td>
            <td style={{ padding: '12px 16px' }} onClick={(e) => e.stopPropagation()}>
              {!lead.assigned_to && onClaimLead && (
                <Button
                  variant="secondary"
                  onClick={() => onClaimLead(lead.id)}
                  style={{ fontSize: '12px', padding: '4px 8px' }}
                >
                  Claim
                </Button>
              )}
            </td>
          </tr>
        )
      })}
    </Table>
  )
}
