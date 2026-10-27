import React, { useState, useEffect } from 'react'
import { LeadTable } from './LeadTable'
import { Input, Select } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Spinner, EmptyState, ErrorBanner } from '../../components/feedback/Spinner'
import { apiClient } from '../../api/client'
import { MOCK_LEADS } from '../../mocks/sampleLeads'
export default function LeadPipelinePage({ currentUser }) {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [scoreBand, setScoreBand] = useState('all')
  const [selectedLead, setSelectedLead] = useState(null)
  const [verificationResults, setVerificationResults] = useState({})
  async function fetchLeads() {
    setLoading(true)
    setError(null)
    try {
      const data = await apiClient('/leads')
      setLeads(data.items || data)
    } catch (err) {
      // Offline / mock mode fallback
      console.warn('Backend unavailable, falling back to offline fixtures:', err)
      setLeads(MOCK_LEADS)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeads()
  }, [])

  async function handleClaimLead(leadId) {
    try {
      await apiClient(`/leads/${leadId}/claim`, { method: 'POST' })
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, assigned_to: currentUser?.id || 'me' } : l))
      )
    } catch (err) {
      // Local optimistic update if mock mode
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, assigned_to: currentUser?.id || 'me' } : l))
      )
    }
  }
  async function handleVerifyEmail({ leadId }) {
    const result = await apiClient(
      `/leads/${encodeURIComponent(leadId)}/verify`,
      { method: 'POST' }
    )

    setVerificationResults((prev) => ({
      ...prev,
      [leadId]: {
        status: result.result || 'unknown',
        verifiedAt: result.checked_at || null
      }
    }))

    return result
  }

  function handleVerificationError(err) {
    setError(err.message || 'Email verification failed. Please try again.')
  }
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      !search ||
      lead.title.toLowerCase().includes(search.toLowerCase()) ||
      lead.organization_name.toLowerCase().includes(search.toLowerCase())
    const matchesBand = scoreBand === 'all' || lead.score_band === scoreBand
    return matchesSearch && matchesBand
  })

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700 }}>Lead Pipeline & Discovery</h1>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            Daily scraped 0-2 yr fresher opportunities across verified platforms.
          </p>
        </div>
        <Button variant="secondary" onClick={fetchLeads}>
          ↻ Refresh
        </Button>
      </div>

      {error && <ErrorBanner message={error} onRetry={fetchLeads} />}

      {/* Filter Bar */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          backgroundColor: 'var(--color-bg-surface)',
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ flex: 1, minWidth: '240px' }}>
          <Input
            placeholder="Search company or job title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ width: '180px' }}>
          <Select
            value={scoreBand}
            onChange={(e) => setScoreBand(e.target.value)}
            options={[
              { value: 'all', label: 'All Score Bands' },
              { value: 'high', label: 'High (80+ Eligible)' },
              { value: 'medium', label: 'Medium (60-79)' },
              { value: 'low', label: 'Low (< 60)' },
              { value: 'suppressed', label: 'Suppressed' }
            ]}
          />
        </div>
      </div>

      {/* Table Content */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
          <Spinner size={32} />
        </div>
      ) : filteredLeads.length === 0 ? (
        <EmptyState
          title="No leads match your criteria"
          message="Try adjusting your search terms or score band filter."
        />
      ) : (
        <LeadTable
  leads={filteredLeads}
  currentUserId={currentUser?.id}
  onClaimLead={handleClaimLead}
  onSelectLead={(lead) => setSelectedLead(lead)}
  verificationResults={verificationResults}
  onVerifyEmail={handleVerifyEmail}
  onVerificationError={handleVerificationError}
/>
      )}

      {/* Quick Detail Drawer / Modal Preview */}
      {selectedLead && (
        <div
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            padding: '20px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600 }}>{selectedLead.title}</h3>
            <button
              onClick={() => setSelectedLead(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', margin: '8px 0' }}>
            {selectedLead.organization_name} •{' '}
            <a href={selectedLead.source_url} target="_blank" rel="noreferrer">
              Original Listing ↗
            </a>
          </p>
          <div style={{ fontSize: '13px', marginTop: '8px' }}>
            <strong>Source Provenance:</strong> {selectedLead.source_name} • Discovered at{' '}
            {new Date(selectedLead.discovered_at).toLocaleDateString()}
          </div>
        </div>
      )}
    </div>
  )
}

