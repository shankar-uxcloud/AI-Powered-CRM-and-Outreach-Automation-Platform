
/**
 * API Client Wrapper (FE-05).
 * Handles JWT Authorization, X-Correlation-ID tracking,
 * and centralized error handling.
 */

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1'

function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export async function apiClient(endpoint, options = {}) {
  const token = localStorage.getItem('auth_token')
  const correlationId = generateUUID()

  const headers = {
    'Content-Type': 'application/json',
    'X-Correlation-ID': correlationId,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  }

  const url = endpoint.startsWith('http')
    ? endpoint
    : `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`

  try {
    const response = await fetch(url, {
      ...options,
      headers
    })

    if (response.status === 401) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')

      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }

      throw {
        status: 401,
        code: 'UNAUTHORIZED',
        message: 'Session expired. Please log in again.'
      }
    }

    if (!response.ok) {
      let errorData = {}

      try {
        errorData = await response.json()
      } catch {
        errorData = { message: response.statusText }
      }

      throw {
        status: response.status,
        code: errorData.code || `HTTP_${response.status}`,
        message:
          errorData.message ||
          errorData.detail ||
          'An unexpected error occurred'
      }
    }

    if (response.status === 204) {
      return null
    }

    return await response.json()
  } catch (err) {
    if (err.status) throw err

    throw {
      status: 0,
      code: 'NETWORK_ERROR',
      message: err.message || 'Network request failed'
    }
  }
}
