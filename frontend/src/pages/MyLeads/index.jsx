import React, { useState, useEffect, useCallback } from 'react'
import { LeadTable } from '../LeadPipeline/LeadTable'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import {
  Spinner,
  EmptyState,
  ErrorBanner
} from '../../components/feedback/Spinner'
import { apiClient } from '../../api/client'
import { MOCK_LEADS } from '../../mocks/sampleLeads'

export default function MyLeadsPage({ currentUser }) {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  const userId = currentUser?.id

  const fetchMyLeads = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await apiClient('/leads')
      const allLeads = data.items || data

      setLeads(
        allLeads.filter(lead => lead.assigned_to === userId)
      )
    } catch (err) {
      console.warn('Using sample leads:', err)

      setLeads(
        MOCK_LEADS.filter(lead => lead.assigned_to === userId)
      )
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchMyLeads()
  }, [fetchMyLeads])

  const filteredLeads = leads.filter(lead => {
    const title = (lead.title || '').toLowerCase()
    const organization = (lead.organization_name || '').toLowerCase()
    const searchText = search.toLowerCase()

    return (
      title.includes(searchText) ||
      organization.includes(searchText)
    )
  })

  return (
    <div style={{
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700 }}>
            My Assigned Leads
          </h1>
          <p style={{
            fontSize: '13px',
            color: 'var(--color-text-muted)'
          }}>
            View and manage opportunities assigned to you.
          </p>
        </div>

        <Button variant="secondary" onClick={fetchMyLeads}>
          ↻ Refresh
        </Button>
      </div>

      <div style={{
        backgroundColor: 'var(--color-bg-surface)',
        padding: '16px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)'
      }}>
        <Input
          placeholder="Search company or job title..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {error && (
        <ErrorBanner message={error} onRetry={fetchMyLeads} />
      )}

      {loading ? (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '48px'
        }}>
          <Spinner size={32} />
        </div>
      ) : filteredLeads.length === 0 ? (
        <EmptyState
          title="No assigned leads found"
          message="Claim a lead from the Lead Pipeline to see it here."
        />
      ) : (
        <LeadTable
          leads={filteredLeads}
          currentUserId={userId}
        />
      )}
    </div>
  )
}