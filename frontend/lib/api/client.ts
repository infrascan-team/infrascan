// Base client with API URL configuration and demo fallback
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const IS_DEMO_MODE = false

export interface ApiResponse<T> {
  data: T
  isDemo: boolean
  message?: string
}

export function getFullMediaUrl(path?: string): string {
  if (!path) return ''
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('blob:') ||
    path.startsWith('data:') ||
    path.startsWith('/samples/')
  ) {
    return path
  }
  return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`
}

export async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  // Retrieve token if stored
  let token: string | null = null
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('infrascan_auth_token')
  }

  const isFormData = typeof FormData !== 'undefined' && options?.body instanceof FormData

  const headers: Record<string, string> = {
    ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
    ...(options?.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  try {
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
  } catch (err) {
    console.warn(`API call failed for ${endpoint}:`, err)
    throw err
  }
}
