// Base client with API URL configuration and demo fallback
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

export const IS_DEMO_MODE = !API_BASE_URL

export interface ApiResponse<T> {
  data: T
  isDemo: boolean
  message?: string
}

export async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  if (IS_DEMO_MODE) {
    throw new Error('Running in offline demo mode. Mock services will resolve local data.')
  }

  // Retrieve token if stored
  let token: string | null = null
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('infrascan_auth_token')
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })
  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(`API error (${res.status}): ${errorText || res.statusText}`)
  }
  const data = await res.json()
  return { data, isDemo: false }
}
