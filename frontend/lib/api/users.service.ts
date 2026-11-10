import { User, UserRole } from '@/types'
import { DEMO_USERS } from './mock-data'
import { apiFetch } from './client'

let localUsers: User[] = [...DEMO_USERS]

export const UsersService = {
  async getAll(): Promise<User[]> {
    try {
      const res = await apiFetch<User[]>('/api/v1/auth/users')
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        return res.data
      }
      return [...localUsers]
    } catch {
      return [...localUsers]
    }
  },

  async create(user: Omit<User, 'id'>): Promise<User> {
    const newUser: User = {
      ...user,
      id: `USR-${Math.floor(100 + Math.random() * 900)}`,
    }
    try {
      const res = await apiFetch<User>('/api/v1/auth/users', {
        method: 'POST',
        body: JSON.stringify(newUser),
      })
      localUsers = [...localUsers, res.data]
      return res.data
    } catch {
      localUsers = [...localUsers, newUser]
      return newUser
    }
  },

  async updateRole(id: string, role: UserRole): Promise<User> {
    try {
      const res = await apiFetch<User>(`/api/v1/auth/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      })
      localUsers = localUsers.map((u) => (u.id === id ? res.data : u))
      return res.data
    } catch {
      localUsers = localUsers.map((u) => (u.id === id ? { ...u, role } : u))
      return localUsers.find((u) => u.id === id)!
    }
  },

  async toggleStatus(id: string, newStatus: 'Active' | 'Inactive'): Promise<User> {
    try {
      const res = await apiFetch<User>(`/api/v1/auth/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      })
      localUsers = localUsers.map((u) => (u.id === id ? res.data : u))
      return res.data
    } catch {
      localUsers = localUsers.map((u) => (u.id === id ? { ...u, status: newStatus } : u))
      return localUsers.find((u) => u.id === id)!
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await apiFetch(`/api/v1/auth/users/${id}`, { method: 'DELETE' })
    } catch (err) {
      console.warn('User delete error:', err)
    }
    localUsers = localUsers.filter((u) => u.id !== id)
  },
}

