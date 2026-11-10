import { InfrastructureAsset } from '@/types'
import { DEMO_ASSETS } from './mock-data'
import { IS_DEMO_MODE, apiFetch } from './client'

let localAssets: InfrastructureAsset[] = [...DEMO_ASSETS]

export const AssetsService = {
  async getAll(): Promise<InfrastructureAsset[]> {
    try {
      const res = await apiFetch<InfrastructureAsset[]>('/api/v1/assets')
      return res.data
    } catch {
      return [...localAssets]
    }
  },

  async getById(id: string): Promise<InfrastructureAsset | null> {
    try {
      const res = await apiFetch<InfrastructureAsset>(`/api/v1/assets/${id}`)
      return res.data
    } catch {
      return localAssets.find((a) => a.id === id) || null
    }
  },

  async create(asset: Omit<InfrastructureAsset, 'id' | 'openFindingsCount' | 'maintenanceHistoryCount'>): Promise<InfrastructureAsset> {
    const newAsset: InfrastructureAsset = {
      ...asset,
      id: `AST-${asset.type.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      openFindingsCount: 0,
      maintenanceHistoryCount: 0,
    }
    try {
      const res = await apiFetch<InfrastructureAsset>('/api/v1/assets', {
        method: 'POST',
        body: JSON.stringify(newAsset),
      })
      localAssets = [res.data, ...localAssets]
      return res.data
    } catch {
      localAssets = [newAsset, ...localAssets]
      return newAsset
    }
  },

  async update(id: string, updates: Partial<InfrastructureAsset>): Promise<InfrastructureAsset> {
    try {
      const res = await apiFetch<InfrastructureAsset>(`/api/v1/assets/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      })
      return res.data
    } catch {
      localAssets = localAssets.map((a) => (a.id === id ? { ...a, ...updates } : a))
      return localAssets.find((a) => a.id === id)!
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await apiFetch(`/api/v1/assets/${id}`, { method: 'DELETE' })
    } catch (err) {
      console.warn('Asset delete error:', err)
    }
    localAssets = localAssets.filter((a) => a.id !== id)
  },
}
