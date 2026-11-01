
import React, { useState } from 'react'

export default function EnrichmentQueuePage() {
  const [company, setCompany] = useState('')
  const [provider, setProvider] = useState('ContactOut')
  const [queue, setQueue] = useState([])

  function addToQueue() {
    if (!company.trim()) {
      alert('Please enter a company or lead name.')
      return
    }

    setQueue([
      ...queue,
      {
        id: Date.now(),
        company: company.trim(),
        provider,
        status: 'Pending'
      }
    ])

    setCompany('')
  }

  function markCompleted(id) {
    setQueue(queue.map(item =>
      item.id === id ? { ...item, status: 'Completed' } : item
    ))
  }

  return (
    <div style={{ padding: '30px' }}>
      <h1>Contact Enrichment Queue</h1>
      <p>Manage manual recruiter contact lookups.</p>

      <div style={{
        background: 'white',
        padding: '24px',
        marginTop: '25px',
        border: '1px solid #ddd',
        borderRadius: '10px'
      }}>
        <h2>Add New Lookup</h2>

        <label>Company or Lead Name</label>
        <input
          value={company}
          onChange={e => setCompany(e.target.value)}
          placeholder="Enter company or lead name"
          style={{
            display: 'block',
            width: '100%',
            padding: '12px',
            margin: '10px 0 20px',
            border: '1px solid #ccc',
            borderRadius: '6px'
          }}
        />

        <label>Select Provider</label>
        <select
          value={provider}
          onChange={e => setProvider(e.target.value)}
          style={{
            display: 'block',
            padding: '12px',
            margin: '10px 0 20px',
            width: '100%'
          }}
        >
          <option>ContactOut</option>
          <option>Snov.io</option>
        </select>

        <button
          onClick={addToQueue}
          style={{
            background: '#2563eb',
            color: 'white',
            padding: '12px 22px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Add to Queue
        </button>
      </div>

      <div style={{
        background: 'white',
        padding: '24px',
        marginTop: '25px',
        border: '1px solid #ddd',
        borderRadius: '10px'
      }}>
        <h2>Enrichment Tasks</h2>

        {queue.length === 0 ? (
          <p>No enrichment tasks yet. Add a lookup above.</p>
        ) : (
          queue.map(item => (
            <div
              key={item.id}
              style={{
                padding: '15px',
                borderBottom: '1px solid #ddd',
                display: 'flex',
                justifyContent: 'space-between',
                gap: '15px'
              }}
            >
              <div>
                <strong>{item.company}</strong>
                <p>Provider: {item.provider}</p>
                <p>Status: {item.status}</p>
              </div>

              {item.status === 'Pending' && (
                <button onClick={() => markCompleted(item.id)}>
                  Mark Completed
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
